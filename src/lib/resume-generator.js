import {
  Document, Paragraph, TextRun, AlignmentType,
  BorderStyle, Packer,
} from 'docx';
import { extractSkills } from './skill-extractor.js';

// ─── Section parser ────────────────────────────────────────────
const SECTION_PATTERNS = [
  [/^(summary|professional summary|profile|objective|about me|career objective|professional profile)/i, 'summary'],
  [/^(work experience|experience|employment|professional experience|career history|work history|relevant experience)/i, 'experience'],
  [/^(education|academic|qualifications|academic background|educational background|alma mater)/i, 'education'],
  [/^(skills|technical skills|competencies|technologies|expertise|key skills|core competencies|computer expertise)/i, 'skills'],
  [/^(certifications?|certificates?|licenses?|credentials|professional development)/i, 'certs'],
  [/^(projects?|key projects?|personal projects?)/i, 'projects'],
  [/^(achievements?|accomplishments?|awards?|honors?)/i, 'achievements'],
];

function extractSections(rawText) {
  const lines = (rawText || '').split(/\r?\n/);
  const sections = { header: [], summary: [], experience: [], education: [], skills: [], certs: [], projects: [], achievements: [] };
  let current = 'header';

  for (const line of lines) {
    const t = line.trim();
    let matched = false;

    if (t.length > 0 && t.length < 60) {
      for (const [pattern, section] of SECTION_PATTERNS) {
        if (pattern.test(t)) {
          current = section;
          matched = true;
          break;
        }
      }
    }

    if (!matched && t) {
      sections[current].push(line);
    }
  }

  return sections;
}

// ─── Pre-process helpers ──────────────────────────────────────

/** Detect if a line is a job title / company / date header */
function isExperienceTitleLine(line) {
  const t = line.trim();
  if (!t || t.length > 120) return false;
  if (/^[•\-\*]/.test(t)) return false;
  const hasDate = /\b(19|20)\d{2}\b|present|current|till date/i.test(t);
  const hasTitleWord = /\b(engineer|manager|analyst|developer|administrator|specialist|consultant|coordinator|supervisor|trainee|associate|director|lead|senior|junior|intern|apprentice|assembler)\b/i.test(t);
  const hasCompany = /\b(ltd|inc|corp|pvt|llc|technologies|solutions|systems|group|company|electronics)\b/i.test(t);
  // Only treat as title if it has concrete signals — date, title word, or company name
  // Don't use the "starts with uppercase" heuristic as it catches continuation text
  return hasDate || hasTitleWord || hasCompany;
}

/** Detect sub-headers inside experience */
function isSubheader(line) {
  const t = line.trim();
  return /^(clients?|responsibilities|job description|technical environment|key achievements|projects?):?\s*$/i.test(t) ||
    (t.endsWith(':') && t.length < 40 && !t.startsWith('•'));
}

/** Merge lone bullet markers AND continuation lines back into their parent bullet.
 *  PDF text extraction often wraps long bullet lines across multiple lines.
 *  e.g. "• Led daily shift huddles to align teams with production targets, assigned tasks, and provided\n
 *        status updates."
 *  → "• Led daily shift huddles to align teams with production targets, assigned tasks, and provided status updates."
 */
function mergeExperienceLines(lines) {
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // Lone bullet marker (•, -, *) on its own — merge with next line
    if (/^[•\-\*]$/.test(t) && i + 1 < lines.length && lines[i + 1].trim()) {
      merged.push(`• ${lines[i + 1].trim()}`);
      i++;
      continue;
    }

    // Check if this line is a continuation of the previous bullet:
    // It's a continuation if: (a) there IS a previous line that was a bullet,
    // (b) this line does NOT start with a bullet marker,
    // (c) this line is NOT a title/company/date header,
    // (d) this line is NOT a section sub-header,
    // (e) line is short-ish text (< 120 chars, no bullet prefix)
    if (
      t && merged.length > 0 &&
      !/^[•\-\*]\s/.test(t) &&
      !isExperienceTitleLine(t) &&
      !isSubheader(t)
    ) {
      const prevTrimmed = merged[merged.length - 1].trim();
      // Only merge into a bullet line (not into title lines)
      if (/^[•\-\*]\s/.test(prevTrimmed)) {
        // Remove trailing period from previous if we're continuing
        const prevClean = prevTrimmed.replace(/\.\s*$/, '');
        merged[merged.length - 1] = `${prevClean} ${t}`;
        continue;
      }
    }

    merged.push(lines[i]);
  }
  return merged;
}

/** Split summary that has inline bullets (• separated) */
function splitSummaryBullets(text) {
  if (!text) return [];
  if (/\s•\s/.test(text) || text.startsWith('•')) {
    return text.split(/\s*•\s*/).filter((p) => p.trim()).map((p) => p.trim());
  }
  return [text.trim()];
}

// ─── Rephrase additional context ──────────────────────────────
// Instead of dumping raw user text, rephrase into professional bullets

function rephraseAdditionalContext(rawText, jobTitle) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = [];

  for (const line of lines) {
    let rephrased = line;

    // Pattern: "Currently working as X at Y from Z to present"
    const workingMatch = line.match(/currently\s+working\s+(?:as\s+)?(?:an?\s+)?(.+?)\s+(?:at|in|for)\s+(.+?)\s+(?:from|since)\s+(.+?)(?:\s+to\s+present)?$/i);
    if (workingMatch) {
      const [, role, company, startDate] = workingMatch;
      rephrased = `Presently serving as ${role} at ${company} since ${startDate}, contributing to operations and team objectives`;
      if (jobTitle) {
        rephrased += ` with skills directly transferable to the ${jobTitle} role`;
      }
      bullets.push(rephrased);
      continue;
    }

    // Pattern: "I have/I am ..."
    const iHaveMatch = line.match(/^i\s+(have|am|was|did|do)\s+/i);
    if (iHaveMatch) {
      rephrased = line.replace(/^i\s+(have|am|was|did|do)\s+/i, (_, verb) => {
        const map = { have: 'Possesses ', am: 'Currently ', was: 'Previously ', did: 'Successfully ', do: 'Regularly ' };
        return map[verb.toLowerCase()] || '';
      });
    }

    // Ensure starts with capital, remove trailing period if missing
    rephrased = rephrased.charAt(0).toUpperCase() + rephrased.slice(1);
    if (!rephrased.endsWith('.')) rephrased += '.';

    // Add professional framing if it's a short note
    if (rephrased.length < 40 && !rephrased.toLowerCase().includes('experience')) {
      rephrased = `Demonstrated capability in ${rephrased.charAt(0).toLowerCase()}${rephrased.slice(1)}`;
    }

    bullets.push(rephrased);
  }

  return bullets;
}

// ─── Enhance summary ─────────────────────────────────────────

function tailorSummary(summary, jobData, matchingSkills, allSkills) {
  const topSkills = matchingSkills.length > 0 ? matchingSkills.slice(0, 4) : allSkills.slice(0, 4);

  if (!summary) {
    return `Results-driven professional with expertise in ${topSkills.join(', ')}. Proven track record of delivering measurable outcomes in dynamic environments, with capabilities directly aligned to the ${jobData.title} role at ${jobData.company}.`;
  }

  // If summary already mentions the target role keywords, return as-is
  const titleWords = jobData.title.split(' ').filter((w) => w.length > 3);
  const alreadyMentionsJob = titleWords.some((w) =>
    summary.toLowerCase().includes(w.toLowerCase())
  );
  if (alreadyMentionsJob) return summary;

  // Append a concise tailored line that references matching skills
  const skillNote = matchingSkills.length >= 2
    ? ` with strong proficiency in ${matchingSkills.slice(0, 3).join(', ')}`
    : '';
  return `${summary.trim().replace(/\.\s*$/, '')}${skillNote}, well-positioned for the ${jobData.title} role at ${jobData.company}.`;
}

// ─── JD analysis & smart bullet enhancement ─────────────────

// Strengthen weak action verbs
const VERB_UPGRADES = {
  'helped with': 'supported',
  'helped': 'supported',
  'worked on': 'delivered',
  'worked with': 'collaborated with',
  'did': 'executed',
  'was responsible for': 'oversaw',
  'was in charge of': 'directed',
  'made sure': 'ensured',
  'took part in': 'contributed to',
  'participated in': 'actively contributed to',
  'assisted with': 'facilitated',
  'assisted in': 'facilitated',
};

function strengthenVerb(text) {
  let result = text;
  for (const [weak, strong] of Object.entries(VERB_UPGRADES)) {
    const pattern = new RegExp(`^${weak.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(result)) {
      result = result.replace(pattern, strong.charAt(0).toUpperCase() + strong.slice(1));
      break;
    }
  }
  return result;
}

/**
 * Extract actionable requirement phrases from the job description.
 * Returns an array of { phrase, keywords } objects — each represents
 * one duty or requirement the employer is looking for.
 */
function extractJDRequirements(description) {
  if (!description) return [];
  const sentences = description
    .split(/[.;•\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 250);

  const reqs = [];
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    // Only keep lines that describe duties, requirements, or qualifications
    if (/\b(responsible|experience|proficiency|knowledge|ability|skilled|manage|develop|implement|design|lead|coordinate|ensure|maintain|monitor|analyze|conduct|perform|support|deliver|collaborate|oversee|familiarity|understanding|proven)\b/i.test(lower)) {
      const words = lower.split(/\s+/).filter((w) => w.length > 3);
      reqs.push({ phrase: sentence, words: new Set(words) });
    }
  }
  return reqs.slice(0, 20);
}

/**
 * Score how well a resume bullet aligns with a JD requirement.
 * Higher score = stronger semantic overlap.
 */
function scoreBulletReqMatch(bulletLower, reqWords) {
  const bulletWords = bulletLower.split(/\s+/).filter((w) => w.length > 3);
  let overlap = 0;
  for (const w of bulletWords) {
    if (reqWords.has(w)) overlap++;
  }
  return overlap;
}

/**
 * Find the JD requirement phrases that the given keyword appears in.
 * This lets us rewrite using actual JD language rather than generic templates.
 */
function findJDContextForKeyword(kw, jdRequirements) {
  const kwLower = kw.toLowerCase();
  for (const req of jdRequirements) {
    if (req.phrase.toLowerCase().includes(kwLower)) return req.phrase;
  }
  return null;
}

/**
 * Rewrite a bullet to naturally incorporate a missing keyword.
 *
 * Strategy priority:
 *   1. Replace a generic/vague term in the bullet with the keyword
 *   2. Mirror JD phrasing — use the actual JD sentence context to inform rewrite
 *   3. Contextual mid-sentence insertion at a natural break point
 *   4. Skip — if none of the above produce a natural result, leave the bullet untouched
 */
function buildParaphrase(bulletText, kw, jdContext) {
  const body = bulletText.replace(/^[•\-\*]\s*/, '').replace(/\.\s*$/, '');
  const strengthened = strengthenVerb(body);

  // 1. Replace generic terms with the keyword when contextually appropriate
  const genericSwaps = [
    [/\bvarious tools\b/i, kw],
    [/\brelated tools\b/i, `${kw} tools`],
    [/\bvarious systems\b/i, `${kw} systems`],
    [/\bindustry standards\b/i, `${kw} standards`],
    [/\bcompany standards\b/i, `${kw} standards`],
    [/\bbest practices\b/i, `${kw} best practices`],
    [/\bexisting processes\b/i, `${kw} processes`],
    [/\bcross-functional teams?\b/i, `cross-functional ${kw} teams`],
    [/\bproduction processes\b/i, `${kw} production processes`],
    [/\bquality standards\b/i, `${kw} quality standards`],
    [/\bvarious (?:methods|methodologies|approaches)\b/i, `${kw} methodologies`],
    [/\brelevant (?:processes|procedures|protocols)\b/i, `${kw} procedures`],
    [/\bkey (?:metrics|measures|indicators)\b/i, `${kw} metrics`],
    [/\bstandard (?:operating )?procedures?\b/i, `${kw} standard operating procedures`],
  ];

  for (const [pattern, replacement] of genericSwaps) {
    if (pattern.test(strengthened)) {
      return `• ${strengthened.replace(pattern, replacement)}.`;
    }
  }

  // 2. Use JD context to build a natural rewrite
  //    If the JD says "experience managing quality assurance programs",
  //    and the bullet says "Managed production workflows and ensured compliance",
  //    rephrase to mirror the JD language naturally.
  if (jdContext) {
    const jdLower = jdContext.toLowerCase();
    // Extract a short action phrase from JD context that includes the keyword
    const kwLower = kw.toLowerCase();
    const kwIdx = jdLower.indexOf(kwLower);
    if (kwIdx !== -1) {
      // Get a few words around the keyword from the JD
      const before = jdLower.slice(Math.max(0, kwIdx - 30), kwIdx).trim();
      const after = jdLower.slice(kwIdx + kwLower.length, kwIdx + kwLower.length + 30).trim();

      // Build a natural bridging phrase from the JD context
      const preposition = before.match(/\b(with|in|for|through|using|via|across|within)\s*$/)?.[1];
      const postPhrase = after.match(/^(\s*\w+(?:\s+\w+){0,2})/)?.[1]?.trim();

      if (preposition) {
        return `• ${strengthened} ${preposition} ${kw}${postPhrase ? ' ' + postPhrase : ''}.`;
      }
    }
  }

  // 3. Insert before a trailing purpose clause ("to improve/reduce/ensure...")
  const trailingMatch = strengthened.match(/^(.+?),?\s+(to\s+(?:improve|reduce|ensure|meet|achieve|support|drive|increase|maintain|enhance|deliver|optimize|streamline|strengthen))\s+(.+)$/i);
  if (trailingMatch) {
    const [, before, connector, after] = trailingMatch;
    return `• ${before}, leveraging ${kw}, ${connector} ${after}.`;
  }

  // 4. Return null to signal "skip" — don't force an unnatural insertion
  return null;
}

/**
 * Walk through experience bullets and enhance them based on the
 * full job description — not just missing keywords but actual JD
 * requirements. Prioritises bullets that naturally align with JD
 * duties and rewrites them using JD-aligned language.
 */
function enhanceExperienceBullets(lines, missingKeywords, jobDescription) {
  const validKeywords = (missingKeywords || [])
    .filter((k) => k && typeof k === 'string')
    .slice(0, 6);
  if (!lines?.length) return lines;

  const jdReqs = extractJDRequirements(jobDescription);
  const enhanced = [...lines];

  // Step 1: Strengthen weak verbs in ALL bullets (always improves quality)
  for (let i = 0; i < enhanced.length; i++) {
    const t = enhanced[i].trim();
    if (/^[•\-\*]\s/.test(t)) {
      const body = t.replace(/^[•\-\*]\s*/, '').replace(/\.\s*$/, '');
      const strengthened = strengthenVerb(body);
      if (strengthened !== body) {
        enhanced[i] = `• ${strengthened}.`;
      }
    }
  }

  if (!validKeywords.length) return enhanced;

  // Step 2: For each missing keyword, find the best bullet to weave it into
  const usedBullets = new Set();
  const maxInjections = Math.min(4, validKeywords.length);
  let injected = 0;

  for (const kw of validKeywords) {
    if (injected >= maxInjections) break;

    const jdContext = findJDContextForKeyword(kw, jdReqs);

    // Score each bullet for how well it fits this keyword
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < enhanced.length; i++) {
      const t = enhanced[i].trim();
      if (!/^[•\-\*]\s/.test(t) || t.length < 35) continue;
      if (usedBullets.has(i)) continue;

      const bodyLower = t.toLowerCase();

      // Skip if keyword already present
      if (bodyLower.includes(kw.toLowerCase())) continue;

      // Must have a real action verb
      const hasAction = /\b(managed|led|supervised|directed|oversaw|coordinated|implemented|developed|maintained|ensured|monitored|tracked|analyzed|scheduled|planned|improved|reduced|increased|achieved|delivered|conducted|performed|handled|configured|facilitated|collaborated|established|designed|built|deployed|streamlined|optimized|trained|coached|mentored|audited|evaluated|reported|assisted|supported|operated|prepared|resolved|executed|initiated|organized|reviewed)\b/i.test(bodyLower);
      if (!hasAction) continue;

      // Score: prefer bullets that share domain words with the JD context
      let score = 1;
      if (jdContext) {
        score += scoreBulletReqMatch(bodyLower, new Set(jdContext.toLowerCase().split(/\s+/)));
      }
      // Prefer longer, more detailed bullets (more room to weave in naturally)
      if (t.length > 60) score += 1;
      if (t.length > 90) score += 1;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) continue;

    const result = buildParaphrase(enhanced[bestIdx], kw, jdContext);
    if (result) {
      enhanced[bestIdx] = result;
      usedBullets.add(bestIdx);
      injected++;
    }
  }

  return enhanced;
}

// ─── Main generator ──────────────────────────────────────────

export async function generateTailoredResume(resumeData, jobData, additionalText = '', linkedInUrl = '', phone = '', contactEmail = '') {
  const sections = extractSections(resumeData.rawText || '');

  const originalSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobData.description || '');
  const matchingSkills = originalSkills.filter((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  // Cap at 5 targeted missing skills — fewer, cleaner, less obvious keyword-stuffing
  const missingToAdd = jobSkills
    .filter((js) => !originalSkills.some((s) => s.toLowerCase() === js.toLowerCase()))
    .slice(0, 5);

  // Skills: matching first, then rest, then targeted missing
  const enhancedSkills = [...new Set([...matchingSkills, ...originalSkills, ...missingToAdd])];

  const rawSummary = sections.summary.join(' ').trim() || resumeData.summary || '';
  const summaryText = tailorSummary(rawSummary, jobData, matchingSkills, enhancedSkills);

  // Experience: merge lone bullets, enhance with keywords
  let experienceLines = mergeExperienceLines(sections.experience);
  if (experienceLines.length < 3 && resumeData.experience) {
    const parsed = Array.isArray(resumeData.experience)
      ? resumeData.experience
      : JSON.parse(resumeData.experience || '[]');
    if (parsed.length > 0) {
      experienceLines = parsed.flatMap((exp) => {
        const l = [];
        if (exp.title) l.push(exp.title);
        if (exp.company) l.push(exp.company);
        if (exp.bullets?.length) l.push(...exp.bullets.map((b) => `• ${b}`));
        l.push('');
        return l;
      });
    }
  }

  // Enhance experience bullets using JD analysis — rewrites using JD language,
  // not just keyword insertion
  experienceLines = enhanceExperienceBullets(experienceLines, missingToAdd, jobData.description || '');

  // Blend rephrased additional context INTO experience section (not as a separate section)
  const rephrasedAdditional = rephraseAdditionalContext(additionalText, jobData.title);
  if (rephrasedAdditional.length > 0) {
    // Append after the last experience entry as new bullets
    experienceLines = [
      ...experienceLines,
      '',
      ...rephrasedAdditional.map((b) => `• ${b}`),
    ];
  }

  const educationLines = sections.education.length
    ? sections.education
    : (Array.isArray(resumeData.education)
        ? resumeData.education
        : JSON.parse(resumeData.education || '[]')).map((e) => (typeof e === 'string' ? e : e.degree || ''));

  // ─── Build content object for preview ─────────────────────────
  const content = {
    name: resumeData.name || 'Your Name',
    summary: summaryText,
    summaryBullets: splitSummaryBullets(summaryText),
    skills: enhancedSkills,
    matchingSkills,
    addedSkills: missingToAdd,
    experience: experienceLines,
    education: educationLines,
    certs: sections.certs || [],
    additional: '',
    additionalBullets: [],
    linkedIn: linkedInUrl || '',
    phone: phone || '',
    contactEmail: contactEmail || '',
    tailoredFor: { title: jobData.title, company: jobData.company },
  };

  // ─── Build Word document ───────────────────────────────────────
  const children = [];

  // Name
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resumeData.name || 'Your Name', bold: true, size: 36, color: '1e1b4b', font: 'Calibri' })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
    }),
  );

  // Contact line: email | phone | linkedin
  const contactParts = [];
  if (contactEmail) contactParts.push(contactEmail);
  if (phone) contactParts.push(phone);
  if (linkedInUrl) contactParts.push(linkedInUrl);
  const contactLine = contactParts.join('  |  ');

  const subtitleParts = [new TextRun({ text: `${jobData.title} | ${jobData.company}`, size: 20, color: '4b5563', font: 'Calibri' })];
  children.push(
    new Paragraph({
      children: subtitleParts,
      alignment: AlignmentType.LEFT,
      spacing: { after: contactLine ? 60 : 160 },
    }),
  );
  if (contactLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactLine, size: 22, color: '4b5563', font: 'Calibri' })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 160 },
      }),
    );
  }
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '4338ca' } },
      spacing: { after: 200 },
    }),
  );

  // Summary
  if (summaryText) {
    children.push(sectionHead('Professional Summary'));
    const bullets = splitSummaryBullets(summaryText);
    if (bullets.length > 1) {
      for (const bullet of bullets) {
        children.push(bullet_para(`• ${bullet}`));
      }
    } else {
      children.push(body_para(summaryText));
    }
    children.push(spacer());
  }

  // Skills
  if (enhancedSkills.length > 0) {
    children.push(sectionHead('Technical Skills'));
    children.push(body_para(enhancedSkills.join(', ')));
    children.push(spacer());
  }

  // Experience
  if (experienceLines.length > 0) {
    children.push(sectionHead('Professional Experience'));
    for (const line of experienceLines) {
      const trimmed = line.trim();
      if (!trimmed) { children.push(spacer(60)); continue; }

      const isBullet = /^[•\-\*]\s/.test(trimmed);
      const isTitle = !isBullet && isExperienceTitleLine(trimmed);
      const isSub = !isBullet && isSubheader(trimmed);

      if (isBullet) {
        const text = trimmed.replace(/^[•\-\*]\s*/, '').trim();
        children.push(bullet_para(`• ${text}`));
      } else if (isSub) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, size: 20, font: 'Calibri', italics: true, color: '4b5563' })],
          spacing: { before: 60, after: 40 },
        }));
      } else if (isTitle) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 20, font: 'Calibri', color: '1e1b4b' })],
          spacing: { before: 160, after: 40 },
          keepWithNext: true,   // prevents orphaned company title at top of page 2
          keepLines: true,
        }));
      } else {
        children.push(body_para(trimmed));
      }
    }
    children.push(spacer());
  }

  // Education
  if (educationLines.length > 0) {
    children.push(sectionHead('Education'));
    for (const line of educationLines) {
      if (!line?.trim()) continue;
      children.push(body_para(line.trim()));
    }
    children.push(spacer());
  }

  // Certifications
  if (sections.certs?.length > 0) {
    children.push(sectionHead('Certifications'));
    for (const line of sections.certs) {
      if (!line?.trim()) continue;
      children.push(body_para(line.trim()));
    }
    children.push(spacer());
  }

  // ABSOLUTELY NO WATERMARK, NO FOOTER, NO TIMESTAMP

  const doc = new Document({
    sections: [{
      properties: {
        // 1440 twips = 1 inch — standard for all pages incl. page 2
        page: { margin: { top: 1440, bottom: 1440, left: 1080, right: 1080 } },
      },
      children,
    }],
  });

  return { buffer: await Packer.toBuffer(doc), content };
}

// ─── Inject missing keywords into resume text (for ATS fix) ───
export function injectKeywordsIntoResume(rawText, missingKeywords) {
  if (!missingKeywords?.length) return rawText;
  const lines = rawText.split('\n');
  const skillsIdx = lines.findIndex((l) => /^(skills|technical skills|competencies|technologies)/i.test(l.trim()));

  if (skillsIdx !== -1) {
    let insertAt = skillsIdx + 1;
    while (insertAt < lines.length && lines[insertAt].trim()) insertAt++;
    lines.splice(insertAt, 0, missingKeywords.join(', '));
  } else {
    lines.push('', 'Skills', missingKeywords.join(', '));
  }

  return lines.join('\n');
}

// ─── Paragraph helpers ────────────────────────────────────────

function sectionHead(text) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '1e1b4b', font: 'Calibri' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'c7d2fe' } },
    spacing: { before: 240, after: 120 },
  });
}

function body_para(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: 'Calibri' })],
    spacing: { after: 60 },
  });
}

function bullet_para(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: 'Calibri' })],
    indent: { left: 280 },
    spacing: { after: 50 },
  });
}

function spacer(after = 100) {
  return new Paragraph({ spacing: { after } });
}

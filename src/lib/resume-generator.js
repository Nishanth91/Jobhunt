import {
  Document, Paragraph, TextRun, AlignmentType,
  BorderStyle, Packer, ExternalHyperlink, ImageRun,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { extractSkills } from './skill-extractor.js';

// Load the LinkedIn logo once — small PNG shipped in /public.
let LINKEDIN_LOGO = null;
try {
  LINKEDIN_LOGO = fs.readFileSync(path.join(process.cwd(), 'public', 'linkedin.png'));
} catch { /* logo optional */ }

// Normalise any LinkedIn input (bare handle, linkedin.com/in/..., http(s), trailing slash)
// into a clickable https URL.
function normaliseLinkedInUrl(raw) {
  if (!raw) return '';
  let u = raw.trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) {
    if (/^linkedin\.com/i.test(u) || /^www\.linkedin\.com/i.test(u)) u = 'https://' + u;
    else if (/^\/?in\//i.test(u)) u = 'https://www.linkedin.com' + (u.startsWith('/') ? u : '/' + u);
    else u = 'https://www.linkedin.com/in/' + u.replace(/^\/+/, '');
  }
  return u;
}

// Friendly label shown next to the logo: "linkedin.com/in/handle"
function linkedInDisplayLabel(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

// ─── Section parser ────────────────────────────────────────────
const SECTION_PATTERNS = [
  [/^(summary|professional summary|profile|objective|about me|career objective|professional profile)\b/i, 'summary'],
  [/^(work experience|experience|employment|professional experience|career history|work history|relevant experience)\b/i, 'experience'],
  [/^(education|academic|qualifications|academic background|educational background|alma mater)(\s*&\s*(technical\s+)?skills)?\s*$/i, 'education'],
  [/^(skills|technical skills|competencies|technologies|expertise|key skills|core competencies|computer expertise)\b/i, 'skills'],
  [/^(certifications?|certificates?|licenses?|credentials|professional development)\b/i, 'certs'],
  [/^(projects?|key projects?|personal projects?)\b/i, 'projects'],
  [/^(achievements?|accomplishments?|awards?|honors?)\b/i, 'achievements'],
];

/**
 * Split a resume's raw text into named sections. Uses short-line
 * heading detection and known section patterns. The first block
 * before any heading is `header` (name + contact).
 *
 * Also detects composite headings like "EDUCATION & TECHNICAL SKILLS"
 * and splits them into two sections so the generator can render each
 * properly.
 */
function extractSections(rawText) {
  const lines = (rawText || '').split(/\r?\n/);
  const sections = {
    header: [], summary: [], experience: [], education: [],
    skills: [], certs: [], projects: [], achievements: [],
  };
  let current = 'header';

  for (const rawLine of lines) {
    const t = rawLine.trim();

    // Heading detection — short, not a bullet, matches a section pattern
    if (t.length > 0 && t.length < 80 && !/^[•\-\*]/.test(t)) {
      let matched = false;
      for (const [pattern, section] of SECTION_PATTERNS) {
        if (pattern.test(t)) {
          current = section;
          matched = true;
          break;
        }
      }
      // Composite "EDUCATION & SKILLS" heading — enter education first
      if (matched) continue;
    }

    if (t) sections[current].push(rawLine);
  }

  return sections;
}

// ─── Experience block parser ──────────────────────────────────
// Splits the experience section into distinct job blocks, each with
// a title line (company | role), a meta line (location | dates), and
// bullet achievements. This is the critical fix for v5 — previously
// the generator just dumped lines in order, which produced the
// collapsed-into-summary bug when AI output had no clear separators.

const DATE_RX = /\b(19|20)\d{2}\b|\bpresent\b|\bcurrent\b|\btill\s+date\b/i;
const TITLE_SEP_RX = /[|•]|\s-\s|\s—\s|\s–\s/;
const TITLE_WORD_RX = /\b(engineer|manager|analyst|developer|administrator|specialist|consultant|coordinator|supervisor|trainee|associate|director|lead|senior|junior|intern|apprentice|assembler|technician|officer|executive|assistant|designer|architect|scientist|operator|planner|scheduler|accountant|clerk|representative|agent)\b/i;
const COMPANY_WORD_RX = /\b(ltd|inc|corp|pvt|llc|limited|company|technologies|solutions|systems|group|electronics|industries|services|enterprises|co\.?)\b/i;

function isJobTitleLine(line) {
  const t = line.trim();
  if (!t || t.length > 140) return false;
  if (/^[•\-\*]/.test(t)) return false;
  // Strong signal: title separator with at least one descriptor
  if (TITLE_SEP_RX.test(t) && (TITLE_WORD_RX.test(t) || COMPANY_WORD_RX.test(t))) return true;
  // Mostly-uppercase header line (COMPANY NAME)
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3) {
    const upperRatio = t.replace(/[^A-Z]/g, '').length / letters.length;
    if (upperRatio > 0.75 && t.length < 80 && !DATE_RX.test(t)) return true;
  }
  return false;
}

function isMetaLine(line) {
  const t = line.trim();
  if (!t || /^[•\-\*]/.test(t)) return false;
  // Meta = location/date line, usually has date or city descriptor
  if (DATE_RX.test(t) && t.length < 100) return true;
  // Short location-only line (e.g. "Winnipeg, MB, Canada")
  if (t.length < 80 && /[A-Z][a-z]+,/.test(t) && !TITLE_WORD_RX.test(t)) return true;
  return false;
}

function isBulletLine(line) {
  return /^[•\-\*]\s+/.test(line.trim());
}

/** Merge lone bullet markers and continuation lines into the parent bullet. */
function mergeBulletContinuations(lines) {
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // Lone bullet marker -> merge with next line
    if (/^[•\-\*]$/.test(t) && i + 1 < lines.length && lines[i + 1].trim()) {
      merged.push(`• ${lines[i + 1].trim()}`);
      i++;
      continue;
    }

    // Continuation of a prior bullet (non-bullet, not a title/meta)
    if (
      t && merged.length > 0 &&
      !isBulletLine(t) &&
      !isJobTitleLine(t) &&
      !isMetaLine(t)
    ) {
      const prev = merged[merged.length - 1].trim();
      if (isBulletLine(prev)) {
        merged[merged.length - 1] = `${prev.replace(/\.\s*$/, '')} ${t}`;
        continue;
      }
    }

    merged.push(lines[i]);
  }
  return merged;
}

/**
 * Parse experience lines into an array of job blocks.
 * Each block: { title: string, meta?: string, bullets: string[] }
 */
function parseExperienceBlocks(lines) {
  const merged = mergeBulletContinuations(lines);
  const blocks = [];
  let cur = null;

  for (const raw of merged) {
    const t = raw.trim();
    if (!t) continue;

    if (isBulletLine(t)) {
      if (!cur) cur = { title: '', meta: '', bullets: [] };
      cur.bullets.push(t.replace(/^[•\-\*]\s*/, '').trim());
      continue;
    }

    if (isJobTitleLine(t)) {
      // Wrapped title: prev block has a title but no meta/bullets, AND
      // this "title" carries a date range. Merge them and peel off the
      // meta after the last pipe (where the date sits).
      if (cur && cur.title && !cur.meta && !cur.bullets.length && DATE_RX.test(t)) {
        const combined = (cur.title.trim() + ' ' + t.trim()).replace(/\s+/g, ' ');
        const lastPipe = combined.lastIndexOf('|');
        if (lastPipe > -1 && DATE_RX.test(combined.slice(lastPipe))) {
          cur.title = combined.slice(0, lastPipe).trim();
          cur.meta = combined.slice(lastPipe + 1).trim();
        } else {
          cur.title = combined;
        }
        continue;
      }
      if (cur && (cur.title || cur.bullets.length)) blocks.push(cur);
      cur = { title: t, meta: '', bullets: [] };
      continue;
    }

    if (isMetaLine(t) && cur && !cur.meta && !cur.bullets.length) {
      cur.meta = t;
      continue;
    }

    // Unclassified line in experience — treat as title if no block yet
    if (!cur) {
      cur = { title: t, meta: '', bullets: [] };
    } else if (cur.bullets.length) {
      // trailing paragraph after bullets — keep as bullet
      cur.bullets.push(t);
    } else if (!cur.meta) {
      cur.meta = t;
    }
  }

  if (cur && (cur.title || cur.bullets.length)) blocks.push(cur);
  return blocks;
}

// ─── Bullet enhancement ───────────────────────────────────────

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

function extractJDRequirements(description) {
  if (!description) return [];
  const sentences = description
    .split(/[.;•\n\r]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 260);

  const reqs = [];
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (/\b(responsible|experience|proficiency|knowledge|ability|skilled|manage|develop|implement|design|lead|coordinate|ensure|maintain|monitor|analyze|conduct|perform|support|deliver|collaborate|oversee|familiarity|understanding|proven|required|must\s+have|candidate)\b/i.test(lower)) {
      const words = lower.split(/\s+/).filter((w) => w.length > 3);
      reqs.push({ phrase: sentence, words: new Set(words) });
    }
  }
  return reqs.slice(0, 25);
}

function findJDContextForKeyword(kw, jdRequirements) {
  const kwLower = kw.toLowerCase();
  for (const req of jdRequirements) {
    if (req.phrase.toLowerCase().includes(kwLower)) return req.phrase;
  }
  return null;
}

/** Rewrite a bullet to naturally incorporate a missing keyword. Returns null to skip. */
function buildParaphrase(bulletText, kw, jdContext) {
  const body = bulletText.replace(/^[•\-\*]\s*/, '').replace(/\.\s*$/, '');
  const strengthened = strengthenVerb(body);

  // 1. Replace generic terms with the keyword
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
    [/\bstandard (?:operating )?procedures?\b/i, `${kw} standard operating procedures`],
  ];

  for (const [pattern, replacement] of genericSwaps) {
    if (pattern.test(strengthened)) {
      return strengthened.replace(pattern, replacement);
    }
  }

  // 2. Insert before a trailing purpose clause ("to improve/reduce/ensure...")
  const trailingMatch = strengthened.match(/^(.+?),?\s+(to\s+(?:improve|reduce|ensure|meet|achieve|support|drive|increase|maintain|enhance|deliver|optimize|streamline|strengthen))\s+(.+)$/i);
  if (trailingMatch) {
    const [, before, connector, after] = trailingMatch;
    return `${before}, leveraging ${kw}, ${connector} ${after}`;
  }

  return null;
}

/** Enhance bullets across all experience blocks with missing keywords. */
function enhanceBlocks(blocks, missingKeywords, jobDescription) {
  const validKeywords = (missingKeywords || [])
    .filter((k) => k && typeof k === 'string')
    .slice(0, 6);
  if (!blocks?.length) return blocks;

  const jdReqs = extractJDRequirements(jobDescription);

  // Strengthen verbs in all bullets first
  for (const block of blocks) {
    block.bullets = block.bullets.map((b) => {
      const strengthened = strengthenVerb(b.replace(/\.\s*$/, ''));
      return strengthened + (strengthened.endsWith('.') ? '' : '.');
    });
  }

  if (!validKeywords.length) return blocks;

  // Inject missing keywords into the best-fit bullet once per keyword
  const used = new Set(); // "blockIdx:bulletIdx"
  const maxInjections = Math.min(4, validKeywords.length);
  let injected = 0;

  const ACTION_RX = /\b(managed|led|supervised|directed|oversaw|coordinated|implemented|developed|maintained|ensured|monitored|tracked|analyzed|scheduled|planned|improved|reduced|increased|achieved|delivered|conducted|performed|handled|configured|facilitated|collaborated|established|designed|built|deployed|streamlined|optimized|trained|coached|mentored|audited|evaluated|reported|assisted|supported|operated|prepared|resolved|executed|initiated|organized|reviewed)\b/i;

  for (const kw of validKeywords) {
    if (injected >= maxInjections) break;
    const jdCtx = findJDContextForKeyword(kw, jdReqs);

    let best = { score: 0, bi: -1, li: -1 };
    for (let bi = 0; bi < blocks.length; bi++) {
      for (let li = 0; li < blocks[bi].bullets.length; li++) {
        const key = `${bi}:${li}`;
        if (used.has(key)) continue;
        const body = blocks[bi].bullets[li];
        if (body.length < 40) continue;
        const lower = body.toLowerCase();
        if (lower.includes(kw.toLowerCase())) continue;
        if (!ACTION_RX.test(lower)) continue;

        let score = 1;
        if (jdCtx) {
          const ctxWords = new Set(jdCtx.toLowerCase().split(/\s+/));
          for (const w of lower.split(/\s+/)) if (ctxWords.has(w)) score++;
        }
        if (body.length > 70) score++;
        if (body.length > 100) score++;

        if (score > best.score) best = { score, bi, li };
      }
    }

    if (best.bi === -1) continue;
    const rewritten = buildParaphrase(blocks[best.bi].bullets[best.li], kw, jdCtx);
    if (rewritten) {
      blocks[best.bi].bullets[best.li] = rewritten.replace(/\.\s*$/, '') + '.';
      used.add(`${best.bi}:${best.li}`);
      injected++;
    }
  }

  return blocks;
}

// ─── Summary tailoring ────────────────────────────────────────

function tailorSummary(summary, jobData, matchingSkills, allSkills) {
  const topSkills = matchingSkills.length > 0 ? matchingSkills.slice(0, 4) : allSkills.slice(0, 4);

  if (!summary) {
    return `Results-driven professional with expertise in ${topSkills.join(', ')}. Proven track record of delivering measurable outcomes in dynamic environments, with capabilities directly aligned to the ${jobData.title} role at ${jobData.company}.`;
  }

  const titleWords = jobData.title.split(' ').filter((w) => w.length > 3);
  const alreadyMentionsJob = titleWords.some((w) =>
    summary.toLowerCase().includes(w.toLowerCase())
  );
  if (alreadyMentionsJob) return summary;

  const skillNote = matchingSkills.length >= 2
    ? ` with strong proficiency in ${matchingSkills.slice(0, 3).join(', ')}`
    : '';
  return `${summary.trim().replace(/\.\s*$/, '')}${skillNote}, well-positioned for the ${jobData.title} role at ${jobData.company}.`;
}

function splitSummaryBullets(text) {
  if (!text) return [];
  if (/\s•\s/.test(text) || text.startsWith('•')) {
    return text.split(/\s*•\s*/).filter((p) => p.trim()).map((p) => p.trim());
  }
  return [text.trim()];
}

// ─── Additional context rephrasing ────────────────────────────

function rephraseAdditionalContext(rawText, jobTitle) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = [];

  for (const line of lines) {
    let rephrased = line;

    const workingMatch = line.match(/currently\s+working\s+(?:as\s+)?(?:an?\s+)?(.+?)\s+(?:at|in|for)\s+(.+?)\s+(?:from|since)\s+(.+?)(?:\s+to\s+present)?$/i);
    if (workingMatch) {
      const [, role, company, startDate] = workingMatch;
      rephrased = `Presently serving as ${role} at ${company} since ${startDate}, contributing to operations and team objectives`;
      if (jobTitle) rephrased += ` with skills directly transferable to the ${jobTitle} role`;
      bullets.push(rephrased + '.');
      continue;
    }

    const iHaveMatch = line.match(/^i\s+(have|am|was|did|do)\s+/i);
    if (iHaveMatch) {
      rephrased = line.replace(/^i\s+(have|am|was|did|do)\s+/i, (_, verb) => {
        const map = { have: 'Possesses ', am: 'Currently ', was: 'Previously ', did: 'Successfully ', do: 'Regularly ' };
        return map[verb.toLowerCase()] || '';
      });
    }

    rephrased = rephrased.charAt(0).toUpperCase() + rephrased.slice(1);
    if (!rephrased.endsWith('.')) rephrased += '.';
    bullets.push(rephrased);
  }

  return bullets;
}

// ─── Contact / header extraction from source resume ───────────

const EMAIL_RX = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RX = /(?:\+?\d[\d\s\-().]{7,}\d)/;
const LINKEDIN_RX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[\w\-/?=&.%]+/i;
const URL_RX = /https?:\/\/\S+/i;

function extractHeaderFromResume(headerLines, fallbackName) {
  const text = (headerLines || []).join('\n');
  const email = (text.match(EMAIL_RX) || [])[0] || '';
  const phone = (text.match(PHONE_RX) || [])[0] || '';
  const linkedIn = (text.match(LINKEDIN_RX) || [])[0] || '';

  // Name: first non-empty line that doesn't look like contact info
  let name = '';
  for (const raw of headerLines) {
    const l = raw.trim();
    if (!l) continue;
    if (EMAIL_RX.test(l) || PHONE_RX.test(l) || URL_RX.test(l)) continue;
    // skip pure address / date lines
    if (DATE_RX.test(l)) continue;
    // prefer short, title-cased lines with 2-6 words
    const words = l.split(/\s+/);
    if (words.length <= 6 && words.length >= 1) { name = l; break; }
  }
  if (!name) name = fallbackName || '';

  return { name, email, phone, linkedIn };
}

// ─── Main generator ──────────────────────────────────────────

export async function generateTailoredResume(
  resumeData, jobData, additionalText = '',
  linkedInUrl = '', phone = '', contactEmail = '',
) {
  const sections = extractSections(resumeData.rawText || '');

  // ── Header: preserve user's original identity; fall back to profile ──
  const extracted = extractHeaderFromResume(sections.header, resumeData.name);
  const displayName = resumeData.name || extracted.name || 'Your Name';
  const displayEmail = contactEmail || extracted.email || '';
  const displayPhone = phone || extracted.phone || '';
  const displayLinkedIn = linkedInUrl || extracted.linkedIn || '';

  // ── Skills: match + original + missing injected ──
  const originalSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobData.description || '');
  const matchingSkills = originalSkills.filter((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  const missingToAdd = jobSkills
    .filter((js) => !originalSkills.some((s) => s.toLowerCase() === js.toLowerCase()))
    .slice(0, 5);

  const capitalizeSkill = (s) => {
    if (/^[A-Z]/.test(s) || /^[a-z]+[A-Z]/.test(s)) return s;
    if (/^(aws|gcp|ci\/cd|html|css|sql|api|jwt|oauth|tdd|bdd|sap|erp|gmp|osha|iso|tpm|pcb|nlp|ios|5s)\b/i.test(s)) return s.toUpperCase();
    return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  };
  const enhancedSkills = [...new Set([...matchingSkills, ...originalSkills, ...missingToAdd])].map(capitalizeSkill);

  // ── Summary ──
  // Separate the opening body paragraph from any supporting bullet points
  // so the document keeps the original layout.
  const summaryBodyLines = [];
  const summaryBulletLines = [];
  for (const raw of sections.summary) {
    const t = raw.trim();
    if (!t) continue;
    if (isBulletLine(t)) summaryBulletLines.push(t.replace(/^[•\-\*]\s*/, '').trim());
    else summaryBodyLines.push(t);
  }
  const rawSummaryBody = summaryBodyLines.join(' ').trim() || resumeData.summary || '';
  const summaryText = tailorSummary(rawSummaryBody, jobData, matchingSkills, enhancedSkills);

  // ── Experience: parse into blocks, then enhance ──
  let expBlocks = parseExperienceBlocks(sections.experience);
  if (expBlocks.length === 0 && resumeData.experience) {
    const parsed = Array.isArray(resumeData.experience)
      ? resumeData.experience
      : JSON.parse(resumeData.experience || '[]');
    expBlocks = (parsed || []).map((exp) => ({
      title: [exp.title, exp.company].filter(Boolean).join(' | '),
      meta: '',
      bullets: exp.bullets || [],
    }));
  }
  expBlocks = enhanceBlocks(expBlocks, missingToAdd, jobData.description || '');

  // Additional context → appended as a final "Recent Updates" block
  const rephrasedAdditional = rephraseAdditionalContext(additionalText, jobData.title);
  if (rephrasedAdditional.length > 0) {
    expBlocks.push({
      title: 'Recent Updates',
      meta: '',
      bullets: rephrasedAdditional,
    });
  }

  // ── Education ──
  const educationLines = sections.education.length
    ? sections.education.map((l) => l.trim()).filter(Boolean)
    : (Array.isArray(resumeData.education)
        ? resumeData.education
        : JSON.parse(resumeData.education || '[]')).map((e) => (typeof e === 'string' ? e : e.degree || ''));

  // ── Content object for preview ──
  const content = {
    name: displayName,
    summary: summaryText,
    summaryBullets: summaryBulletLines.length ? summaryBulletLines : splitSummaryBullets(summaryText),
    summaryBody: summaryText,
    skills: enhancedSkills,
    matchingSkills,
    addedSkills: missingToAdd,
    experienceBlocks: expBlocks,
    // Back-compat flat experience lines used by legacy preview components
    experience: flattenBlocksToLines(expBlocks),
    education: educationLines,
    certs: sections.certs || [],
    additional: '',
    additionalBullets: [],
    linkedIn: displayLinkedIn,
    phone: displayPhone,
    contactEmail: displayEmail,
    tailoredFor: { title: jobData.title, company: jobData.company },
  };

  // ── DOCX output ──
  const children = [];

  // Name header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: displayName, bold: true, size: 36, color: '1e1b4b', font: 'Calibri' })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
    }),
  );

  // Contact line: email | phone  [ logo ]  LinkedIn-hyperlink
  const textParts = [displayEmail, displayPhone].filter(Boolean);
  const liUrl = normaliseLinkedInUrl(displayLinkedIn);
  if (textParts.length > 0 || liUrl) {
    const runs = [];
    if (textParts.length > 0) {
      runs.push(new TextRun({ text: textParts.join('  |  '), size: 22, color: '4b5563', font: 'Calibri' }));
    }
    if (liUrl) {
      if (textParts.length > 0) {
        runs.push(new TextRun({ text: '  |  ', size: 22, color: '4b5563', font: 'Calibri' }));
      }
      if (LINKEDIN_LOGO) {
        runs.push(new ImageRun({
          data: LINKEDIN_LOGO,
          transformation: { width: 12, height: 12 },
        }));
        runs.push(new TextRun({ text: ' ', size: 22, font: 'Calibri' }));
      }
      runs.push(new ExternalHyperlink({
        link: liUrl,
        children: [
          new TextRun({
            text: linkedInDisplayLabel(liUrl),
            size: 22, color: '0A66C2', underline: {}, font: 'Calibri',
          }),
        ],
      }));
    }
    children.push(
      new Paragraph({ children: runs, alignment: AlignmentType.LEFT, spacing: { after: 60 } }),
    );
  }

  // Subtle "tailored for" subtitle — NOT replacing contact info
  children.push(
    new Paragraph({
      children: [new TextRun({
        text: `Customized for: ${jobData.title} — ${jobData.company}`,
        size: 18, color: '64748b', italics: true, font: 'Calibri',
      })],
      spacing: { after: 120 },
    }),
  );
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '4338ca' } },
      spacing: { after: 200 },
    }),
  );

  // Summary — body paragraph + optional supporting bullets
  if (summaryText || summaryBulletLines.length) {
    children.push(sectionHead('Professional Summary'));
    if (summaryText) children.push(body_para(summaryText));
    for (const b of summaryBulletLines) {
      children.push(bullet_para(`• ${b}`));
    }
    children.push(spacer());
  }

  // Skills
  if (enhancedSkills.length > 0) {
    children.push(sectionHead('Technical Skills'));
    children.push(body_para(enhancedSkills.join(', ')));
    children.push(spacer());
  }

  // Experience — proper block structure
  if (expBlocks.length > 0) {
    children.push(sectionHead('Professional Experience'));
    for (const block of expBlocks) {
      if (block.title) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: block.title, bold: true, size: 22, font: 'Calibri', color: '1e1b4b',
          })],
          spacing: { before: 160, after: 30 },
          keepWithNext: true,
          keepLines: true,
        }));
      }
      if (block.meta) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: block.meta, size: 20, font: 'Calibri', italics: true, color: '4b5563',
          })],
          spacing: { after: 60 },
          keepWithNext: true,
        }));
      }
      for (const b of (block.bullets || [])) {
        const text = b.replace(/^[•\-\*]\s*/, '').trim();
        if (!text) continue;
        children.push(bullet_para(`• ${text}`));
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

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1080, right: 1080 } },
      },
      children,
    }],
  });

  // Build plain-text representation of the tailored resume — used by
  // the ATS scorer so scores reflect what the employer actually sees.
  const plainText = buildPlainText({
    name: displayName,
    email: displayEmail,
    phone: displayPhone,
    linkedIn: displayLinkedIn,
    tailoredFor: jobData,
    summary: summaryText,
    summaryBullets: summaryBulletLines,
    skills: enhancedSkills,
    experience: expBlocks,
    education: educationLines,
    certs: sections.certs || [],
  });

  return { buffer: await Packer.toBuffer(doc), content, plainText };
}

function buildPlainText({ name, email, phone, linkedIn, tailoredFor, summary, summaryBullets, skills, experience, education, certs }) {
  const out = [];
  out.push(name);
  const contact = [email, phone, linkedIn].filter(Boolean).join(' | ');
  if (contact) out.push(contact);
  if (tailoredFor?.title) out.push(`Target: ${tailoredFor.title} at ${tailoredFor.company}`);
  out.push('');

  if (summary || summaryBullets?.length) {
    out.push('PROFESSIONAL SUMMARY');
    if (summary) out.push(summary);
    for (const b of (summaryBullets || [])) out.push(`• ${b}`);
    out.push('');
  }
  if (skills?.length) {
    out.push('TECHNICAL SKILLS');
    out.push(skills.join(', '));
    out.push('');
  }
  if (experience?.length) {
    out.push('PROFESSIONAL EXPERIENCE');
    for (const b of experience) {
      if (b.title) out.push(b.title);
      if (b.meta) out.push(b.meta);
      for (const bullet of (b.bullets || [])) out.push(`• ${bullet.replace(/^[•\-\*]\s*/, '')}`);
      out.push('');
    }
  }
  if (education?.length) {
    out.push('EDUCATION');
    for (const e of education) if (e?.trim()) out.push(e.trim());
    out.push('');
  }
  if (certs?.length) {
    out.push('CERTIFICATIONS');
    for (const c of certs) if (c?.trim()) out.push(c.trim());
    out.push('');
  }
  return out.join('\n');
}

// Flatten blocks into legacy-format line array for the preview panel.
function flattenBlocksToLines(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.title) out.push(b.title);
    if (b.meta) out.push(b.meta);
    for (const bullet of (b.bullets || [])) {
      const txt = bullet.replace(/^[•\-\*]\s*/, '');
      out.push(`• ${txt}`);
    }
    out.push('');
  }
  return out;
}

// ─── Inject missing keywords into a plain resume text (ATS fix) ───
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

// ─── DOCX paragraph helpers ────────────────────────────────────

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

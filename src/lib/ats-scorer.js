import { extractSkills, extractKeywords } from './skill-extractor.js';

/**
 * v5 ATS scorer — designed to reflect how modern ATS rankers work:
 * keyword overlap, section completeness, semantic/synonym tolerance,
 * and placement weighting (title/summary beats skills dump).
 *
 * Returns 0–100 with breakdown and actionable suggestions.
 */
export function calculateATSScore(resumeText, jobDescription, opts = {}) {
  const { jobTitle: jobTitleHint = '' } = opts;
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = filterActionableKeywords(extractKeywords(jobDescription));

  const resumeLower = resumeText.toLowerCase();

  // ── 1. Skills match (35%) — includes stem/synonym tolerance ──
  const matchedSkills = resumeSkills.filter((s) =>
    jobSkills.some((js) => skillsRoughlyEqual(s, js))
  );
  const skillsScore = jobSkills.length > 0
    ? Math.min((matchedSkills.length / jobSkills.length) * 100, 100)
    : 70;

  // ── 2. Keyword coverage (30%) — placement-weighted ──
  const topJobKeywords = jobKeywords.slice(0, 30);
  const { hit: matchedKeywords, weightedScore: keywordScore } = scoreKeywordCoverage(
    topJobKeywords, resumeText,
  );

  // ── 3. Format score (15%) — section completeness + structure ──
  const formatChecks = [
    /\b(email|@)\b|[\w.]+@[\w.]+/i,
    /\b(phone|tel|mobile)\b|\d[\d\s\-().]{7,}\d/,
    /\b(experience|work history|employment|professional experience)\b/i,
    /\b(education|degree|university|bachelor|master|diploma)\b/i,
    /\b(skills|technical skills|competencies)\b/i,
    /\b(summary|profile|objective|professional summary)\b/i,
  ];
  const passedChecks = formatChecks.filter((r) => r.test(resumeText)).length;
  let formatScore = (passedChecks / formatChecks.length) * 100;

  // Bonus: clear bullet formatting signals ATS-friendly layout
  const bulletCount = (resumeText.match(/^\s*[•\-\*]\s+/gm) || []).length;
  if (bulletCount >= 6) formatScore = Math.min(100, formatScore + 8);

  // ── 4. Experience match (15%) ──
  const jobRequiresExp = extractRequiredYears(jobDescription);
  const resumeExp = estimateResumeYears(resumeText);
  let experienceScore = 75;
  if (jobRequiresExp > 0 && resumeExp > 0) {
    const ratio = resumeExp / jobRequiresExp;
    if (ratio >= 1) experienceScore = 100;
    else if (ratio >= 0.7) experienceScore = 85;
    else if (ratio >= 0.5) experienceScore = 65;
    else experienceScore = 45;
  } else if (jobRequiresExp === 0) {
    experienceScore = 85;
  }

  // ── 5. Title relevance (5%) — job title words present in resume ──
  const jobTitle = jobTitleHint || extractJobTitleFromJD(jobDescription);
  let titleScore = 70;
  if (jobTitle) {
    const titleWords = jobTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const present = titleWords.filter((w) => resumeLower.includes(w)).length;
    titleScore = titleWords.length ? Math.round((present / titleWords.length) * 100) : 70;
  }

  const total = Math.round(
    skillsScore * 0.35 +
    keywordScore * 0.30 +
    formatScore * 0.15 +
    experienceScore * 0.15 +
    titleScore * 0.05,
  );

  const missingSkills = jobSkills.filter((s) =>
    !resumeSkills.some((rs) => skillsRoughlyEqual(rs, s))
  ).slice(0, 8);

  const missingKeywords = topJobKeywords
    .filter((kw) => !containsKeyword(resumeLower, kw))
    .slice(0, 6);

  return {
    total: Math.min(total, 100),
    breakdown: {
      skills: Math.round(skillsScore),
      keywords: Math.round(keywordScore),
      format: Math.round(formatScore),
      experience: Math.round(experienceScore),
      title: Math.round(titleScore),
    },
    matchedSkills,
    missingSkills,
    missingKeywords,
    suggestions: generateSuggestions(missingSkills, missingKeywords, formatScore, passedChecks),
  };
}

/**
 * Match score = hiring probability (0-100). Unlike ATS, which is
 * about resume parseability, this measures job/candidate fit.
 */
export function calculateMatchScore(resumeData, jobTitle, jobDescription, location) {
  const resumeSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobDescription);

  const matchedSkills = resumeSkills.filter((s) =>
    jobSkills.some((js) => skillsRoughlyEqual(s, js))
  );
  const skillsScore = jobSkills.length > 0
    ? Math.min((matchedSkills.length / Math.max(jobSkills.length, 1)) * 100, 100)
    : 50;

  const userTitle = (resumeData.jobTitle || '').toLowerCase();
  const jobTitleWords = jobTitle.toLowerCase().split(/\s+/);
  const userTitleWords = userTitle.split(/\s+/);
  const titleOverlap = jobTitleWords.filter((w) => userTitleWords.some((uw) => uw.includes(w) || w.includes(uw))).length;
  const titleScore = jobTitleWords.length > 0
    ? Math.min((titleOverlap / jobTitleWords.length) * 100, 100)
    : 50;

  const jobRequiresExp = extractRequiredYears(jobDescription);
  const resumeExp = resumeData.yearsExp || 0;
  let expScore = 70;
  if (jobRequiresExp > 0 && resumeExp > 0) {
    const ratio = resumeExp / jobRequiresExp;
    expScore = ratio >= 1 ? 100 : ratio >= 0.7 ? 80 : ratio >= 0.5 ? 60 : 40;
  }

  const total = Math.round(skillsScore * 0.5 + titleScore * 0.3 + expScore * 0.2);
  return Math.min(Math.max(total, 5), 98);
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Keep only keywords that actually matter to an ATS match. Filters out
 * JD filler words ("looking", "responsible", "seeking") and generic
 * connective verbs so the score reflects substantive overlap.
 */
const JD_NOISE_WORDS = new Set([
  'looking', 'seeking', 'responsible', 'managing', 'including', 'required',
  'must', 'preferred', 'ability', 'strong', 'working', 'proven', 'experience',
  'knowledge', 'understanding', 'familiarity', 'demonstrated', 'candidate',
  'company', 'team', 'teams', 'role', 'position', 'year', 'years', 'plus',
  'across', 'using', 'within', 'related', 'ideal', 'focused', 'committed',
  'join', 'join.', 'applicable', 'etc', 'least', 'minimum', 'well', 'highly',
  'excellent', 'effective', 'successful', 'successfully', 'environment',
  'environments', 'provide', 'provided', 'include', 'includes',
]);

function filterActionableKeywords(kws) {
  const cleaned = [];
  const seen = new Set();
  for (const k of kws) {
    const w = k.toLowerCase().replace(/[^a-z0-9+#/]/g, '').replace(/\.+$/, '');
    if (JD_NOISE_WORDS.has(w)) continue;
    if (w.length < 4) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    cleaned.push(w);
  }
  return cleaned;
}

function scoreKeywordCoverage(keywords, resumeText) {
  if (!keywords.length) return { hit: [], weightedScore: 60 };
  const lower = resumeText.toLowerCase();

  // Detect where in the resume the keyword lives (title/summary vs bullet vs skills list)
  // Each keyword's contribution is weighted by the best section it appears in.
  const { titleBlock, summaryBlock, skillsBlock, expBlock } = sliceResumeSections(resumeText);

  let total = 0;
  let maxPossible = 0;
  const hit = [];
  for (const kw of keywords) {
    // weight per keyword
    const w = 1;
    maxPossible += w;

    const kwLow = kw.toLowerCase();
    if (!lower.includes(kwLow)) continue;
    hit.push(kw);

    // Placement weighting — anywhere in resume is 0.6 base; summary 0.85; title 1.0
    let placement = 0.6;
    if (titleBlock.includes(kwLow)) placement = 1.0;
    else if (summaryBlock.includes(kwLow)) placement = 0.9;
    else if (expBlock.includes(kwLow)) placement = 0.85;
    else if (skillsBlock.includes(kwLow)) placement = 0.7;

    total += w * placement;
  }

  const coverage = maxPossible > 0 ? total / maxPossible : 0.6;
  return { hit, weightedScore: Math.round(coverage * 100) };
}

function sliceResumeSections(text) {
  const lower = text.toLowerCase();
  const lines = lower.split('\n');
  const find = (rx) => lines.findIndex((l) => rx.test(l.trim()));

  const summaryIdx = find(/^(summary|profile|objective|professional summary|about me)/);
  const expIdx = find(/^(experience|professional experience|work experience|employment|work history)/);
  const eduIdx = find(/^(education|qualifications|academic)/);
  const skillsIdx = find(/^(skills|technical skills|competencies|technologies)/);

  const totalLines = lines.length;
  const end = (after, fallbacks) => {
    const candidates = fallbacks.filter((i) => i > after);
    return candidates.length ? Math.min(...candidates) : totalLines;
  };

  const title = lines.slice(0, Math.max(3, summaryIdx !== -1 ? summaryIdx : 3)).join(' ');
  const summary = summaryIdx !== -1
    ? lines.slice(summaryIdx, end(summaryIdx, [expIdx, eduIdx, skillsIdx])).join(' ')
    : '';
  const exp = expIdx !== -1
    ? lines.slice(expIdx, end(expIdx, [eduIdx, skillsIdx])).join(' ')
    : '';
  const skills = skillsIdx !== -1
    ? lines.slice(skillsIdx, end(skillsIdx, [expIdx, eduIdx])).join(' ')
    : '';

  return { titleBlock: title, summaryBlock: summary, expBlock: exp, skillsBlock: skills };
}

// Synonym / stem tolerance for skills comparison
const SKILL_ALIASES = [
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['node.js', 'nodejs', 'node'],
  ['postgresql', 'postgres'],
  ['continuous improvement', 'kaizen'],
  ['5s', 'five s'],
  ['power bi', 'powerbi'],
  ['lean manufacturing', 'lean'],
  ['quality assurance', 'qa'],
  ['quality control', 'qc'],
  ['preventive maintenance', 'tpm'],
  ['ci/cd', 'continuous integration'],
  ['machine learning', 'ml'],
  ['artificial intelligence', 'ai'],
];

function skillsRoughlyEqual(a, b) {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return true;
  for (const group of SKILL_ALIASES) {
    if (group.includes(la) && group.includes(lb)) return true;
  }
  // stem tolerance — match if one is prefix of the other and long enough
  if (la.length > 5 && (la.startsWith(lb) || lb.startsWith(la))) return true;
  return false;
}

function containsKeyword(lowerText, kw) {
  const kwLow = kw.toLowerCase();
  if (lowerText.includes(kwLow)) return true;
  // Check singular/plural tolerance
  if (kwLow.endsWith('s') && lowerText.includes(kwLow.slice(0, -1))) return true;
  if (lowerText.includes(kwLow + 's')) return true;
  return false;
}

function extractJobTitleFromJD(jd) {
  if (!jd) return '';
  const lines = jd.split('\n').slice(0, 5);
  const titleLine = lines.find((l) => /\b(engineer|manager|developer|analyst|designer|director|lead|specialist|consultant|coordinator|supervisor|officer)\b/i.test(l));
  return titleLine?.trim() || '';
}

function extractRequiredYears(text) {
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/i,
    /minimum\s+(?:of\s+)?(\d+)\s+years?/i,
    /at\s+least\s+(\d+)\s+years?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1]);
  }
  return 0;
}

function estimateResumeYears(text) {
  // Allow month words between the dash and end year (e.g. "Apr 2021 – May 2024")
  // and the em-dash variant (—). Case-insensitive and global.
  const yearPattern = /(?:[a-z]{3,9}\s+)?(\d{4})\s*[-–—]\s*(?:[a-z]{3,9}\s+)?(\d{4}|present|current|till\s+date|now)/gi;
  let totalMonths = 0;
  let match;
  while ((match = yearPattern.exec(text)) !== null) {
    const start = parseInt(match[1]);
    const endStr = match[2].toLowerCase();
    const end = endStr.includes('present') || endStr.includes('current') || endStr.includes('now') || endStr.includes('till')
      ? new Date().getFullYear()
      : parseInt(endStr);
    if (end >= start && start > 1980) totalMonths += (end - start) * 12;
  }
  return totalMonths > 0 ? Math.round(totalMonths / 12) : 0;
}

function generateSuggestions(missingSkills, missingKeywords, formatScore, passedChecks) {
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add these missing skills if you have them: ${missingSkills.slice(0, 4).join(', ')}`);
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Weave these JD terms into your bullets: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  if (passedChecks < 5) {
    suggestions.push('Ensure your resume has distinct Summary, Experience, Education, and Skills sections');
  }
  if (formatScore < 70) {
    suggestions.push('Use bullet points (•) under each role — ATS parsers prefer bulleted achievements');
  }
  return suggestions;
}

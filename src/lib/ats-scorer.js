import { extractSkills, extractKeywords } from './skill-extractor.js';

/**
 * Calculates an ATS (Applicant Tracking System) score for a resume against a job description.
 * Returns a score from 0-100 with a detailed breakdown.
 */
export function calculateATSScore(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);

  // 1. Skills match score (40%)
  const matchedSkills = resumeSkills.filter((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  const skillsScore = jobSkills.length > 0
    ? Math.min((matchedSkills.length / jobSkills.length) * 100, 100)
    : 50;

  // 2. Keyword match score (35%)
  const topJobKeywords = jobKeywords.slice(0, 30);
  const matchedKeywords = topJobKeywords.filter((kw) =>
    resumeKeywords.some((rk) => rk.toLowerCase() === kw.toLowerCase()) ||
    resumeText.toLowerCase().includes(kw.toLowerCase())
  );
  const keywordScore = topJobKeywords.length > 0
    ? Math.min((matchedKeywords.length / topJobKeywords.length) * 100, 100)
    : 50;

  // 3. Format score (15%) — check for key resume sections
  const formatChecks = [
    /contact|email|phone/i,
    /experience|work history/i,
    /education|degree|university/i,
    /skills/i,
    /summary|objective|profile/i,
  ];
  const passedChecks = formatChecks.filter((r) => r.test(resumeText)).length;
  const formatScore = (passedChecks / formatChecks.length) * 100;

  // 4. Experience level match (10%)
  const jobRequiresExp = extractRequiredYears(jobDescription);
  const resumeExp = estimateResumeYears(resumeText);
  let experienceScore = 75; // default neutral
  if (jobRequiresExp > 0 && resumeExp > 0) {
    const ratio = resumeExp / jobRequiresExp;
    if (ratio >= 1) experienceScore = 100;
    else if (ratio >= 0.7) experienceScore = 80;
    else if (ratio >= 0.5) experienceScore = 60;
    else experienceScore = 40;
  }

  // Weighted total
  const total = Math.round(
    skillsScore * 0.40 +
    keywordScore * 0.35 +
    formatScore * 0.15 +
    experienceScore * 0.10
  );

  // Missing items for suggestions
  const missingSkills = jobSkills.filter((s) =>
    !resumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
  ).slice(0, 8);

  const missingKeywords = topJobKeywords
    .filter((kw) => !resumeText.toLowerCase().includes(kw.toLowerCase()))
    .slice(0, 6);

  return {
    total: Math.min(total, 100),
    breakdown: {
      skills: Math.round(skillsScore),
      keywords: Math.round(keywordScore),
      format: Math.round(formatScore),
      experience: Math.round(experienceScore),
    },
    matchedSkills,
    missingSkills,
    missingKeywords,
    suggestions: generateSuggestions(missingSkills, missingKeywords, formatScore),
  };
}

/**
 * Calculates how well a resume matches a job (hiring probability).
 */
export function calculateMatchScore(resumeData, jobTitle, jobDescription, location) {
  const resumeSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobDescription);
  const jobKeywords = extractKeywords(jobDescription);

  // Skills overlap (50%)
  const matchedSkills = resumeSkills.filter((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  const skillsScore = jobSkills.length > 0
    ? Math.min((matchedSkills.length / Math.max(jobSkills.length, 1)) * 100, 100)
    : 50;

  // Title relevance (30%) — check if user's job title keywords appear in job title/description
  const userTitle = (resumeData.jobTitle || '').toLowerCase();
  const jobTitleWords = jobTitle.toLowerCase().split(/\s+/);
  const userTitleWords = userTitle.split(/\s+/);
  const titleOverlap = jobTitleWords.filter((w) => userTitleWords.some((uw) => uw.includes(w) || w.includes(uw))).length;
  const titleScore = jobTitleWords.length > 0
    ? Math.min((titleOverlap / jobTitleWords.length) * 100, 100)
    : 50;

  // Experience fit (20%)
  const jobRequiresExp = extractRequiredYears(jobDescription);
  const resumeExp = resumeData.yearsExp || 0;
  let expScore = 70;
  if (jobRequiresExp > 0 && resumeExp > 0) {
    const ratio = resumeExp / jobRequiresExp;
    expScore = ratio >= 1 ? 100 : ratio >= 0.7 ? 80 : ratio >= 0.5 ? 60 : 40;
  }

  const total = Math.round(skillsScore * 0.5 + titleScore * 0.3 + expScore * 0.2);
  return Math.min(Math.max(total, 5), 98); // never 0% or 100%
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
  const yearPattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi;
  let totalMonths = 0;
  let match;
  while ((match = yearPattern.exec(text)) !== null) {
    const start = parseInt(match[1]);
    const end = match[2].toLowerCase().includes('present') || match[2].toLowerCase().includes('current')
      ? new Date().getFullYear()
      : parseInt(match[2]);
    if (end >= start && start > 1980) totalMonths += (end - start) * 12;
  }
  return totalMonths > 0 ? Math.round(totalMonths / 12) : 0;
}

function generateSuggestions(missingSkills, missingKeywords, formatScore) {
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add these missing skills if you have them: ${missingSkills.slice(0, 4).join(', ')}`);
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Include these terms from the job description: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  if (formatScore < 80) {
    suggestions.push('Ensure your resume has clear sections: Summary, Experience, Education, and Skills');
  }
  return suggestions;
}

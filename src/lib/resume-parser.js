import { extractSkills, extractExperience, extractEducation, estimateYearsOfExperience, extractJobTitle } from './skill-extractor.js';

export async function parseResume(buffer, mimeType) {
  let rawText = '';

  if (mimeType === 'application/pdf') {
    rawText = await parsePDF(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    rawText = await parseWord(buffer);
  } else if (mimeType === 'text/plain') {
    rawText = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, Word (.docx), or text file.');
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Could not extract text from the file. Please ensure it is not a scanned image.');
  }

  return parseResumeText(rawText);
}

async function parsePDF(buffer) {
  // Use the lib version directly to avoid pdf-parse loading test files in Next.js
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseWord(buffer) {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function parseResumeText(rawText) {
  const skills = extractSkills(rawText);
  const experience = extractExperience(rawText);
  const education = extractEducation(rawText);
  const yearsExp = estimateYearsOfExperience(rawText);
  const jobTitle = extractJobTitle(rawText);
  const summary = extractSummary(rawText);

  return {
    rawText,
    skills,
    experience,
    education,
    yearsExp,
    jobTitle,
    summary,
  };
}

function extractSummary(text) {
  const lines = text.split('\n');
  const summaryStart = lines.findIndex((l) =>
    /^(summary|profile|objective|about me)/i.test(l.trim())
  );

  if (summaryStart === -1) return null;

  const summaryLines = [];
  for (let i = summaryStart + 1; i < Math.min(summaryStart + 8, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^(experience|education|skills|certifications|projects)/i.test(line)) break;
    summaryLines.push(line);
  }

  return summaryLines.join(' ').slice(0, 500) || null;
}

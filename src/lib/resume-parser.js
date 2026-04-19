import {
  extractSkills, extractExperience, extractEducation,
  estimateYearsOfExperience, extractJobTitle,
} from './skill-extractor.js';

/**
 * Parse an uploaded resume into text + structured sections.
 * DOCX uploads preserve paragraph and list boundaries via HTML; PDFs
 * fall back to raw text. The result always includes a normalised
 * `rawText` (bullet markers, blank-line paragraph breaks) so the
 * tailored-resume generator can reliably split sections/blocks.
 */
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
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * DOCX parsing — convert to HTML first so we preserve paragraph and
 * list-item boundaries, then flatten into text with:
 *   • bullet marker for list items
 *   blank lines between paragraphs
 * This lets the generator reliably detect bullets, job titles, etc.
 */
async function parseWord(buffer) {
  const mammoth = (await import('mammoth')).default;
  try {
    const html = (await mammoth.convertToHtml({ buffer })).value || '';
    const structured = htmlToStructuredText(html);
    if (structured.trim().length > 50) return structured;
  } catch (_) {
    // fall through
  }
  // Fallback to raw text if HTML conversion fails
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Convert mammoth HTML into structured text.
 * - <p>, <h1>-<h3>, <h4>: treat as paragraphs separated by blank line
 * - <li>: prefix with "• "
 * - <br>: line break
 * - <strong>/<b> wrapping an entire paragraph: mark with zero-width marker
 *   so we keep it bold-ish. Simpler: uppercase short headings below.
 */
export function htmlToStructuredText(html) {
  if (!html) return '';
  let s = html;

  // Normalise self-closing and preserve structure
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // Convert list items to bullet lines; items already newline-separated
  s = s.replace(/<li[^>]*>\s*/gi, '\u0001• ');
  s = s.replace(/<\/li>/gi, '\u0001');

  // Paragraphs and headings — ensure double newline after each
  s = s.replace(/<\/(p|h[1-6])>/gi, '\u0002');
  s = s.replace(/<(p|h[1-6])[^>]*>/gi, '');

  // Drop everything else inside tags
  s = s.replace(/<[^>]+>/g, '');

  // Decode entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCodePoint(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(parseInt(c, 10)));

  // Collapse markers into real breaks
  s = s.replace(/\u0001/g, '\n');     // list-item separators -> newline
  s = s.replace(/\u0002/g, '\n\n');   // paragraph/heading -> blank line

  // Clean up
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
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
    /^(summary|profile|objective|about me|professional summary)/i.test(l.trim())
  );

  if (summaryStart === -1) return null;

  const summaryLines = [];
  for (let i = summaryStart + 1; i < Math.min(summaryStart + 12, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) {
      if (summaryLines.length > 0) break; // blank line after content = end
      continue;
    }
    if (/^(experience|education|skills|certifications|projects|work history)/i.test(line)) break;
    summaryLines.push(line);
  }

  return summaryLines.join(' ').slice(0, 600) || null;
}

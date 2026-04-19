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
  return normalisePdfText(data.text || '');
}

/**
 * PDF text extraction is lossy — section headings and job titles
 * frequently get glued to the next line (e.g. "…quality specifications.
 * PROFESSIONAL EXPERIENCEPRICE ELECTRONICS | Electronics Assembler").
 * Without reintroducing those boundaries the generator sees the whole
 * resume as one paragraph.
 *
 * This pre-processor injects \n\n breaks where the structure was lost:
 *   1. Before any known section heading, even if it's mid-line or
 *      fused to the next word.
 *   2. Before ALL-CAPS company-name patterns ("TATA ELECTRONICS PVT LTD |")
 *      which signal a new job block.
 *   3. Before date-range meta lines ("Winnipeg, MB | Aug 2025 – Present").
 *   4. Splits run-on experience descriptions into bullet-per-sentence.
 */
const SECTION_HEADINGS = [
  'PROFESSIONAL SUMMARY', 'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE',
  'EMPLOYMENT HISTORY', 'TECHNICAL SKILLS', 'KEY SKILLS', 'CORE COMPETENCIES',
  'CAREER OBJECTIVE', 'ACADEMIC BACKGROUND',
  'CERTIFICATIONS', 'QUALIFICATIONS', 'ACHIEVEMENTS', 'ACCOMPLISHMENTS',
  'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CREDENTIALS', 'LICENSES',
  'PROJECTS', 'AWARDS', 'OBJECTIVE', 'SUMMARY', 'PROFILE',
].sort((a, b) => b.length - a.length); // longest-first prevents "SUMMARY" from matching before "PROFESSIONAL SUMMARY"

const SECTION_HEADING_RX = new RegExp(
  `(^|\\s)(${SECTION_HEADINGS.join('|')})(?=[A-Z]|\\s|$)`,
  'g',
);

const COMPANY_TITLE_RX = /(^|\s)([A-Z][A-Z0-9&.\-]+(?:\s+[A-Z][A-Z0-9&.\-]+){1,6}\s*\|\s*[A-Z][A-Za-z])/g;
const LOCATION_META_RX = /\s+([A-Z][a-zA-Z]+(?:,\s*[A-Z][a-zA-Z]+)+\s*\|\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}))/g;
const DATE_END_BEFORE_TEXT_RX = /(\b(?:Present|Current|\d{4}))\s+([A-Z][a-z])/g;
const SENTENCE_SPLIT_RX = /\.\s+([A-Z][a-z])/g;

/**
 * PDF text extraction is lossy — section headings, job titles, meta
 * lines and bullets get fused together. Without reintroducing those
 * breaks the generator sees the whole resume as one paragraph.
 *
 * This pre-processor rebuilds the structure:
 *   1. Splits section headings off — even when fused to adjacent words
 *      (e.g. "specifications. PROFESSIONAL EXPERIENCEPRICE ELECTRONICS").
 *   2. Splits ALL-CAPS company-name patterns ("TATA ELECTRONICS | Role").
 *   3. Splits city/state meta from a trailing description.
 *   4. Splits date-range-end ("May 2024 Managed…") from the next sentence.
 *   5. Splits run-on sentences inside experience into bullet points.
 *   6. Re-joins pdf soft-wraps (mid-paragraph line breaks) so each
 *      paragraph is a single logical line for the block parser.
 */
export function normalisePdfText(raw) {
  if (!raw) return '';
  let s = raw.replace(/\r\n?/g, '\n');

  // 1. Section headings — single pass, longest-first alternation.
  s = s.replace(SECTION_HEADING_RX, (_m, _prefix, heading) => `\n\n${heading}\n`);

  // 2. Company title pattern.
  s = s.replace(COMPANY_TITLE_RX, (_m, _prefix, capture) => `\n\n${capture}`);

  // 3. Location + date meta.
  s = s.replace(LOCATION_META_RX, '\n$1');

  // 4. After date-range end, break before the next sentence.
  s = s.replace(DATE_END_BEFORE_TEXT_RX, '$1\n$2');

  // 5. Run-on sentence → bullet, restricted to experience region.
  s = splitExperienceSentences(s);

  // 6. Re-join pdf soft-wraps.
  s = joinSoftWraps(s);

  // Cleanup
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function splitExperienceSentences(text) {
  const expStart = text.match(/\n(PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY)\n/);
  if (!expStart) return text;
  const sIdx = expStart.index + expStart[0].length;
  const tail = text.slice(sIdx);
  const sectionEnd = tail.match(/\n(TECHNICAL SKILLS|KEY SKILLS|SKILLS|EDUCATION|CERTIFICATIONS|PROJECTS|ACHIEVEMENTS|AWARDS|QUALIFICATIONS|CREDENTIALS)\n/);
  const eIdx = sectionEnd ? sIdx + sectionEnd.index : text.length;
  const before = text.slice(0, sIdx);
  const region = text.slice(sIdx, eIdx);
  const after = text.slice(eIdx);
  return before + region.replace(SENTENCE_SPLIT_RX, '.\n• $1') + after;
}

/**
 * Merge lines broken mid-paragraph by pdf hard-wrap. A line is a
 * continuation if the previous line didn't end at a sentence boundary
 * and the current line doesn't start a new structural element.
 */
function joinSoftWraps(text) {
  const COMPANY_LINE_RX = /^[A-Z][A-Z0-9&.\-]+(?:\s+[A-Z][A-Z0-9&.\-]+)+\s*\|/;
  const IS_SECTION = (t) => SECTION_HEADINGS.some((h) => t === h);
  const IS_BULLET = (t) => /^[•\-\*]\s/.test(t);
  const IS_META   = (t) => /\b\d{4}\b/.test(t) && /\|/.test(t) && t.length < 140;
  const PREV_ENDS_PARAGRAPH = (t) =>
    t === '' ||
    /[.!?:]$/.test(t) ||
    /\b(Present|Current|till\s+date|now)$/i.test(t) ||
    /\b\d{4}$/.test(t) ||
    IS_SECTION(t) ||
    COMPANY_LINE_RX.test(t);

  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (out.length === 0) { out.push(line); continue; }
    const prevT = out[out.length - 1].trim();

    const curIsStructural =
      t === '' ||
      IS_SECTION(t) ||
      IS_BULLET(t) ||
      COMPANY_LINE_RX.test(t) ||
      IS_META(t);

    // Always merge when prev clearly wrapped (trailing comma, hanging word)
    const prevIsIncomplete = /,$/.test(prevT);

    if (t && (prevIsIncomplete || (!curIsStructural && !PREV_ENDS_PARAGRAPH(prevT)))) {
      out[out.length - 1] = (out[out.length - 1].replace(/\s+$/, '')) + ' ' + t;
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
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

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractSkills } from '@/lib/skill-extractor';
import { NextResponse } from 'next/server';

/**
 * Generate interview preparation material from the job description and resume.
 * This is entirely local — no external AI API needed.
 * Strategy: parse the JD for key responsibilities/requirements, cross-reference
 * with the user's resume, and build structured interview prep content.
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { jobId, resumeId } = await request.json();

  const [job, resume] = await Promise.all([
    prisma.savedJob.findFirst({ where: { id: jobId, userId: session.user.id } }),
    resumeId ? prisma.resume.findFirst({ where: { id: resumeId, userId: session.user.id } }) : null,
  ]);

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const desc = job.description || '';
  const resumeText = resume?.rawText || '';
  const resumeSkills = resume ? JSON.parse(resume.skills || '[]') : [];
  const jobSkills = extractSkills(desc);

  // ─── 1. Extract key responsibilities from JD ──────────────────
  const responsibilities = extractResponsibilities(desc);

  // ─── 2. Build behavioral questions from responsibilities ──────
  const behavioralQs = buildBehavioralQuestions(responsibilities, job.title);

  // ─── 3. Build technical questions from skills overlap ─────────
  const matchedSkills = resumeSkills.filter((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = jobSkills.filter((s) =>
    !resumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
  );
  const technicalQs = buildTechnicalQuestions(matchedSkills, missingSkills, job.title);

  // ─── 4. Build STAR-method talking points from resume ──────────
  const starPoints = buildSTARPoints(resumeText, responsibilities);

  // ─── 5. Questions to ask the interviewer ──────────────────────
  const askInterviewer = buildInterviewerQuestions(job.company, job.title);

  // ─── 6. Company research prompts ──────────────────────────────
  const researchTips = [
    `Look up recent news about ${job.company} — mention something specific in the interview.`,
    `Check ${job.company}'s LinkedIn page for recent posts and company culture insights.`,
    `Review the company's Glassdoor page for interview experiences and common questions.`,
    `Understand the team structure — is this role part of a larger department or a small team?`,
  ];

  return NextResponse.json({
    jobTitle: job.title,
    company: job.company,
    behavioral: behavioralQs,
    technical: technicalQs,
    starPoints,
    askInterviewer,
    researchTips,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 6),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────

function extractResponsibilities(description) {
  const sentences = description
    .split(/[.\n•;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 250);

  const duties = sentences.filter((s) =>
    /\b(responsible|manage|develop|implement|coordinate|ensure|maintain|lead|design|analyze|support|deliver|oversee|conduct|monitor|collaborate|create|perform|prepare|supervise|train|evaluate|plan|organize|review|execute|build|drive|improve|establish)\b/i.test(s)
  );

  return duties.slice(0, 8);
}

function buildBehavioralQuestions(responsibilities, jobTitle) {
  const questions = [];

  // Map responsibilities to behavioral question templates
  const templates = [
    { pattern: /\b(lead|manage|supervise|direct|oversee)\b/i, q: 'Tell me about a time you led a team through a challenging project. What was your approach and the outcome?', tip: 'Focus on your leadership style, how you delegated, and measurable results.' },
    { pattern: /\b(collaborate|cross-functional|teams?|partner)\b/i, q: 'Describe a situation where you had to work with multiple departments or stakeholders. How did you manage different priorities?', tip: 'Emphasize communication skills and how you aligned different groups toward a common goal.' },
    { pattern: /\b(improve|optimize|enhance|streamline|reduce)\b/i, q: 'Give an example of a process you improved. What metrics did you use to measure success?', tip: 'Quantify the impact — percentage improvement, time saved, cost reduction.' },
    { pattern: /\b(problem|troubleshoot|resolve|fix|debug|issue)\b/i, q: 'Tell me about a complex problem you solved at work. Walk me through your thought process.', tip: 'Use the STAR method. Show analytical thinking and persistence.' },
    { pattern: /\b(deadline|pressure|fast-paced|urgent|priority|prioriti)\b/i, q: 'How do you handle competing deadlines and prioritize your work?', tip: 'Give a concrete example with specific tools or methods you use.' },
    { pattern: /\b(train|mentor|coach|onboard|develop staff)\b/i, q: 'Describe your experience training or mentoring others. How do you ensure knowledge transfer?', tip: 'Talk about specific training programs or mentoring outcomes.' },
    { pattern: /\b(quality|compliance|standard|audit|inspect)\b/i, q: 'How do you ensure quality standards are met consistently? Give a specific example.', tip: 'Reference specific standards, processes, or tools you used.' },
    { pattern: /\b(change|transition|adapt|implement new)\b/i, q: 'Tell me about a time you had to adapt to a significant change at work. How did you handle it?', tip: 'Show flexibility and a positive attitude toward change.' },
  ];

  const used = new Set();
  for (const resp of responsibilities) {
    for (const t of templates) {
      if (t.pattern.test(resp) && !used.has(t.q)) {
        questions.push({ question: t.q, tip: t.tip, context: resp });
        used.add(t.q);
        break;
      }
    }
    if (questions.length >= 5) break;
  }

  // Always add the classic opener
  if (questions.length < 6) {
    questions.unshift({
      question: `Why are you interested in the ${jobTitle} position, and what makes you a strong fit?`,
      tip: 'Connect your background directly to 2-3 key requirements from the job description.',
      context: '',
    });
  }

  return questions.slice(0, 6);
}

function buildTechnicalQuestions(matchedSkills, missingSkills, jobTitle) {
  const questions = [];

  // Questions about matched skills (they'll expect you to know these)
  for (const skill of matchedSkills.slice(0, 3)) {
    questions.push({
      question: `Can you describe your experience with ${skill}? How have you applied it in your work?`,
      tip: `You have this skill — prepare a concrete example with measurable impact.`,
      type: 'strength',
    });
  }

  // Questions about missing skills (they may probe these gaps)
  for (const skill of missingSkills.slice(0, 2)) {
    questions.push({
      question: `This role requires experience with ${skill}. What's your familiarity with it?`,
      tip: `Be honest but positive — mention related experience or willingness to learn quickly.`,
      type: 'gap',
    });
  }

  // Role-specific technical question
  questions.push({
    question: `What would your first 30-60-90 days look like as the new ${jobTitle}?`,
    tip: 'Show you understand the role: 30 days = learn, 60 days = contribute, 90 days = lead initiatives.',
    type: 'general',
  });

  return questions;
}

function buildSTARPoints(resumeText, responsibilities) {
  if (!resumeText) return [];

  const lines = resumeText.split('\n').filter((l) => /^[•\-\*]\s/.test(l.trim()));
  const points = [];

  // Find bullets that align with job responsibilities
  for (const resp of responsibilities.slice(0, 4)) {
    const respWords = resp.toLowerCase().split(/\s+/).filter((w) => w.length > 4);

    let bestBullet = '';
    let bestScore = 0;

    for (const line of lines) {
      const lower = line.toLowerCase();
      const overlap = respWords.filter((w) => lower.includes(w)).length;
      if (overlap > bestScore) {
        bestScore = overlap;
        bestBullet = line.replace(/^[•\-\*]\s*/, '').trim();
      }
    }

    if (bestBullet && bestScore >= 2) {
      points.push({
        situation: `When asked about: "${resp.slice(0, 80)}..."`,
        action: bestBullet,
        tip: 'Frame this as: Situation → Task → Action → Result. Quantify the result.',
      });
    }
  }

  return points.slice(0, 4);
}

function buildInterviewerQuestions(company, title) {
  return [
    `What does a typical day look like for the ${title}?`,
    `What are the biggest challenges the team is currently facing?`,
    `How do you measure success in this role during the first year?`,
    `What growth or development opportunities does ${company} offer?`,
    `Can you tell me about the team I'd be working with?`,
  ];
}

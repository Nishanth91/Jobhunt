import { extractSkills } from './skill-extractor.js';

/**
 * Generates a personalized cover letter.
 */
export function generateCoverLetter(resumeData, jobData, userName) {
  const parsedSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobData.description || '');
  const matchingSkills = parsedSkills
    .filter((s) => jobSkills.some((js) => js.toLowerCase() === s.toLowerCase()))
    .slice(0, 4);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const skillsLine = matchingSkills.length > 0
    ? `My proficiency in ${matchingSkills.join(', ')} aligns closely with the requirements outlined in the posting.`
    : 'My background and skill set closely align with the requirements outlined in the posting.';

  const expLine = resumeData.yearsExp > 0
    ? `With ${resumeData.yearsExp}+ years of professional experience`
    : 'With my professional experience';

  const letter = `${today}

Hiring Manager
${jobData.company}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}. ${expLine}, I am confident in my ability to make a meaningful contribution to your team.

${skillsLine} Throughout my career, I have built a track record of delivering high-quality results while collaborating effectively with cross-functional teams.

${resumeData.summary
    ? `${resumeData.summary.slice(0, 200)}...`
    : `I bring a strong foundation in the technical and professional skills required for this role, and I am eager to apply them in a new challenge at ${jobData.company}.`
  }

I am particularly drawn to this opportunity because it represents a chance to grow within a dynamic environment while contributing meaningfully to ${jobData.company}'s goals. I would welcome the chance to discuss how my background aligns with your needs.

Thank you for your time and consideration. I look forward to the possibility of working with your team.

Sincerely,
${userName}`;

  return letter;
}

/**
 * Generates a short, punchy email subject and body for applying.
 */
export function generateApplicationEmail(resumeData, jobData, userName) {
  const subject = `Application for ${jobData.title} – ${userName}`;

  const parsedSkills = Array.isArray(resumeData.skills)
    ? resumeData.skills
    : JSON.parse(resumeData.skills || '[]');

  const jobSkills = extractSkills(jobData.description || '');
  const topMatch = parsedSkills.find((s) =>
    jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );

  const body = `Dear Hiring Manager,

I hope this message finds you well. I am reaching out to apply for the ${jobData.title} role at ${jobData.company}.

${resumeData.yearsExp > 0 ? `I bring ${resumeData.yearsExp}+ years of experience` : 'I bring hands-on experience'}${topMatch ? ` with a strong background in ${topMatch}` : ''}, and I am confident my profile aligns well with this opportunity.

Please find my resume attached. I would love to discuss how I can contribute to ${jobData.company}.

Thank you for your consideration.

Best regards,
${userName}`;

  return { subject, body };
}

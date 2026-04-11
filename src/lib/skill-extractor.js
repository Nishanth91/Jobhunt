// Comprehensive skills database for extraction
const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
  'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'bash', 'shell', 'powershell',
  // Web & Frontend
  'react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte', 'html', 'css', 'sass', 'less',
  'tailwind', 'bootstrap', 'webpack', 'vite', 'jquery', 'redux', 'graphql', 'rest api',
  // Backend & Server
  'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'laravel',
  'asp.net', 'nestjs', 'fastify', 'koa', 'gin', 'fiber',
  // Databases
  'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'cassandra',
  'dynamodb', 'elasticsearch', 'firebase', 'supabase', 'prisma', 'sequelize', 'mongoose',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'github actions', 'gitlab ci', 'circleci', 'heroku', 'vercel', 'netlify', 'linux',
  // Data & AI/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
  'numpy', 'spark', 'hadoop', 'tableau', 'power bi', 'data analysis', 'nlp', 'computer vision',
  // Mobile
  'react native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',
  // Tools
  'git', 'github', 'jira', 'confluence', 'figma', 'adobe xd', 'postman', 'swagger',
  'vs code', 'intellij', 'eclipse', 'xcode', 'android studio',
  // Methodologies
  'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices',
  'rest', 'soap', 'oauth', 'jwt', 'api design',
  // Manufacturing & Production
  'lean manufacturing', '5s', 'kaizen', 'six sigma', 'sap pp', 'sap',
  'quality control', 'quality assurance', 'sop', 'root cause analysis',
  'production planning', 'erp', 'gmp', 'iso 9001', 'osha',
  'power bi', 'pcb assembly', 'preventive maintenance', 'tpm',
  'value stream mapping', 'capacity planning', 'supply chain',
  'continuous improvement', 'safety compliance',
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
  'time management', 'project management', 'collaboration', 'adaptability', 'creativity',
  'analytical', 'detail oriented', 'self motivated', 'presentation', 'negotiation',
  'mentoring', 'coaching', 'strategic thinking', 'decision making', 'conflict resolution',
];

const EXPERIENCE_KEYWORDS = [
  'developed', 'built', 'designed', 'implemented', 'led', 'managed', 'created',
  'improved', 'optimized', 'maintained', 'deployed', 'architected', 'launched',
  'reduced', 'increased', 'delivered', 'collaborated', 'mentored', 'analyzed',
  'established', 'streamlined', 'automated', 'integrated', 'migrated', 'scaled',
];

export function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const found = [];

  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[+.]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.push(skill);
    }
  }

  for (const skill of SOFT_SKILLS) {
    if (lowerText.includes(skill)) {
      found.push(skill);
    }
  }

  return [...new Set(found)];
}

export function extractKeywords(text) {
  const lowerText = text.toLowerCase();
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
    'those', 'it', 'its', 'we', 'you', 'they', 'their', 'our', 'your',
  ]);

  const words = lowerText
    .replace(/[^\w\s.+#]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Count frequency
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  // Return top keywords sorted by frequency
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

export function extractExperience(text) {
  const experiences = [];
  const lines = text.split('\n');
  let inExperienceSection = false;
  let currentExp = null;

  const expHeaders = ['experience', 'work history', 'employment', 'professional experience'];
  const nextSectionHeaders = ['education', 'skills', 'certifications', 'projects', 'achievements'];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    if (expHeaders.some((h) => lower.includes(h))) {
      inExperienceSection = true;
      continue;
    }

    if (inExperienceSection && nextSectionHeaders.some((h) => lower === h || lower.startsWith(h + ' '))) {
      inExperienceSection = false;
    }

    if (inExperienceSection && line.trim().length > 0) {
      // Detect year ranges like 2019-2023 or 2020 - Present
      const yearPattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/i;
      if (yearPattern.test(line)) {
        if (currentExp) experiences.push(currentExp);
        currentExp = { title: line.trim(), bullets: [] };
      } else if (currentExp && line.trim().startsWith('•') || line.trim().startsWith('-')) {
        currentExp.bullets.push(line.trim().replace(/^[•\-]\s*/, ''));
      } else if (currentExp && line.trim().length > 0) {
        currentExp.company = line.trim();
      }
    }
  }

  if (currentExp) experiences.push(currentExp);
  return experiences;
}

export function extractEducation(text) {
  const education = [];
  const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'b.s', 'b.a', 'm.s', 'm.a', 'mba'];
  const lines = text.split('\n');

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (degrees.some((d) => lower.includes(d))) {
      education.push(line.trim());
    }
  }

  return education;
}

export function estimateYearsOfExperience(text) {
  // Look for explicit mentions of years of experience
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+experience/i,
    /(\d+)\+?\s*years?\s+experience/i,
    /experience\s+of\s+(\d+)\+?\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1]);
  }

  // Estimate from date ranges
  const yearPattern = /(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi;
  let totalMonths = 0;
  let match;

  while ((match = yearPattern.exec(text)) !== null) {
    const start = parseInt(match[1]);
    const end = match[2].toLowerCase().includes('present') || match[2].toLowerCase().includes('current')
      ? new Date().getFullYear()
      : parseInt(match[2]);
    totalMonths += (end - start) * 12;
  }

  return totalMonths > 0 ? Math.round(totalMonths / 12) : 0;
}

export function extractJobTitle(text) {
  const titlePatterns = [
    /(?:^|\n)([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Analyst|Designer|Architect|Lead|Director|Specialist|Consultant|Officer|Coordinator))/m,
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

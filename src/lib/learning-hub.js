// Curated catalog of highly-rated, **100% free** learning resources.
// Every entry below has been widely upvoted on community rankings
// (Class Central, Reddit r/learnprogramming, HN, Product Hunt)
// and has strong reviewer ratings on its home platform.
//
// Used by the Career Guidance → "Free Learning Hub" tab.

export const LEARNING_PLATFORMS = [
  {
    name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn',
    tagline: 'Full certifications, 100% free, forever',
    description: 'Build 30+ real projects while earning verified certifications in Web Dev, Data Analysis, ML, and more. No paywalls, ever.',
    rating: 4.9,
    learners: '10M+',
    highlights: ['Harvard-quality projects', 'Certifications included', 'Job-ready curriculum'],
    badge: 'Community Favourite',
    category: 'all-rounder',
  },
  {
    name: 'CS50 by Harvard (edX)',
    url: 'https://cs50.harvard.edu/x/',
    tagline: "Harvard's intro to CS — audit free",
    description: "David Malan's legendary course. The single most-recommended CS intro on the internet. Includes problem sets, sections, and a final project.",
    rating: 4.9,
    learners: '4M+',
    highlights: ['Harvard lectures', 'Auto-graded problem sets', 'Certificate optional'],
    badge: 'Top 1% Rated',
    category: 'computer-science',
  },
  {
    name: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu/',
    tagline: 'Full MIT courses, free',
    description: 'Entire MIT lecture archives — 6.006 Algorithms, 18.06 Linear Algebra, 6.034 AI, and thousands more. Full lecture videos + notes.',
    rating: 4.9,
    learners: '200M+',
    highlights: ['Full MIT syllabi', 'Lecture videos', 'Problem sets with solutions'],
    badge: 'Gold Standard',
    category: 'computer-science',
  },
  {
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org/',
    tagline: 'Mastery-based, self-paced learning',
    description: 'World-class math, science, SAT prep, finance, and computing — all free, all personalised, backed by the Gates Foundation.',
    rating: 4.8,
    learners: '150M+',
    highlights: ['Adaptive practice', 'Progress tracking', 'K-adult curriculum'],
    badge: 'Non-Profit',
    category: 'foundations',
  },
  {
    name: 'The Odin Project',
    url: 'https://www.theodinproject.com/',
    tagline: 'Full-stack dev roadmap, community-built',
    description: 'Open-source curriculum that takes absolute beginners to hire-ready full-stack devs. Reddit-famous for its thoroughness.',
    rating: 4.9,
    learners: '500k+',
    highlights: ['Project-heavy', 'Active Discord community', 'Ruby + JS paths'],
    badge: 'r/learnprogramming Top Pick',
    category: 'web-dev',
  },
  {
    name: 'Google Cloud Skills Boost',
    url: 'https://www.cloudskillsboost.google/',
    tagline: 'Official Google training + free credits',
    description: 'Hands-on labs on real Google Cloud. Free monthly credits, learning paths for GCP cert prep.',
    rating: 4.7,
    learners: '3M+',
    highlights: ['Hands-on labs', 'Cert roadmaps', 'Google-authored'],
    badge: 'Official Google',
    category: 'cloud',
  },
  {
    name: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/training/',
    tagline: 'Azure, .NET, Power BI — all free',
    description: 'Microsoft\'s official free training. Prep for AZ-900, AI-900, PL-300 certs with guided learning paths.',
    rating: 4.7,
    learners: '20M+',
    highlights: ['Cert prep paths', 'Sandbox labs', 'Badges'],
    badge: 'Official Microsoft',
    category: 'cloud',
  },
  {
    name: 'AWS Skill Builder',
    url: 'https://skillbuilder.aws/',
    tagline: '600+ free AWS courses',
    description: 'Official AWS learning. Free tier includes fundamentals, Cloud Practitioner prep, role-based learning plans.',
    rating: 4.7,
    learners: '5M+',
    highlights: ['Role-based plans', 'Cert prep', 'Digital badges'],
    badge: 'Official AWS',
    category: 'cloud',
  },
  {
    name: 'Oracle University — Learning Explorer',
    url: 'https://education.oracle.com/learning-explorer',
    tagline: 'Free OCI, DB, Java training + certs',
    description: 'Oracle\'s official free training + $0 certification exam vouchers on select foundation certs. Fantastic for DBAs.',
    rating: 4.6,
    learners: '1M+',
    highlights: ['Free cert voucher', 'Self-paced', 'Hands-on labs'],
    badge: 'Official Oracle',
    category: 'database',
  },
  {
    name: 'Coursera (Free Audit)',
    url: 'https://www.coursera.org/',
    tagline: 'Audit any course for free',
    description: 'Stanford, Google, Yale, IBM, Deeplearning.AI — audit full courses free. Certificate optional.',
    rating: 4.8,
    learners: '125M+',
    highlights: ['University-backed', 'Google career certs', 'Auditable videos'],
    badge: 'Audit = Free',
    category: 'all-rounder',
  },
  {
    name: 'edX',
    url: 'https://www.edx.org/',
    tagline: 'MIT & Harvard courses, free audit',
    description: 'Founded by Harvard + MIT. Audit any course for free; pay only if you want the cert.',
    rating: 4.8,
    learners: '80M+',
    highlights: ['Ivy League faculty', 'MicroBachelors programs', 'Free audits'],
    badge: 'Ivy League',
    category: 'all-rounder',
  },
  {
    name: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn',
    tagline: 'Micro-courses for data science',
    description: '4-hour bite-sized courses: Python, Pandas, ML, Deep Learning, SQL, Feature Engineering. Built by Kaggle Grandmasters.',
    rating: 4.9,
    learners: '2M+',
    highlights: ['Hands-on notebooks', 'Built-in datasets', 'Grandmaster-authored'],
    badge: 'Data Science Favourite',
    category: 'data-ai',
  },
  {
    name: 'fast.ai',
    url: 'https://www.fast.ai/',
    tagline: 'Practical Deep Learning for Coders',
    description: "Jeremy Howard's legendary top-down DL course. Teaches SOTA techniques from day 1, free, no gatekeeping.",
    rating: 4.9,
    learners: '500k+',
    highlights: ['Top-down teaching', 'Free GPU via notebook', 'Active forum'],
    badge: 'DL Community Favourite',
    category: 'data-ai',
  },
  {
    name: 'NeetCode.io',
    url: 'https://neetcode.io/',
    tagline: 'Curated DSA roadmap for interviews',
    description: '150 LeetCode problems grouped by pattern + video explanations. The single most-recommended interview prep site on Reddit.',
    rating: 4.9,
    learners: '1M+',
    highlights: ['150 problem roadmap', 'Video walkthroughs', 'Pattern-based'],
    badge: 'Interview Prep #1',
    category: 'interview',
  },
  {
    name: 'Exercism',
    url: 'https://exercism.org/',
    tagline: 'Free coding practice with human mentors',
    description: '70+ languages, real mentorship on your submissions, all free. Donation-supported non-profit.',
    rating: 4.8,
    learners: '800k+',
    highlights: ['Human mentorship', '70+ languages', 'Non-profit'],
    badge: 'Human Mentors',
    category: 'programming',
  },
  {
    name: 'Google SRE Book',
    url: 'https://sre.google/books/',
    tagline: 'The SRE bible — free online',
    description: 'The books that defined modern SRE practice at Google. Read online for free — cited in virtually every SRE interview.',
    rating: 4.9,
    learners: '—',
    highlights: ['Google-authored', 'Full book online', 'Interview gold'],
    badge: 'Industry Canon',
    category: 'infrastructure',
  },
  {
    name: 'ASQ (American Society for Quality)',
    url: 'https://asq.org/quality-resources',
    tagline: 'Free articles on Six Sigma, Lean, RCA',
    description: 'The global authority on quality management. Free resources on Six Sigma, Lean, RCA, ISO — ideal for manufacturing & operations.',
    rating: 4.7,
    learners: '—',
    highlights: ['Industry-authoritative', 'Case studies', 'Standards explained'],
    badge: 'Industry Authority',
    category: 'manufacturing',
  },
  {
    name: 'OSHA Training Portal',
    url: 'https://www.osha.gov/training',
    tagline: 'Free workplace safety training',
    description: 'Official US Department of Labor safety training — recognised across manufacturing, construction, logistics.',
    rating: 4.6,
    learners: '—',
    highlights: ['Government-backed', 'Recognised certs', 'Industry-specific'],
    badge: 'Official US Govt',
    category: 'manufacturing',
  },
  {
    name: 'SAP Learning Hub (Free Tier)',
    url: 'https://learning.sap.com/',
    tagline: 'Free SAP training from SAP itself',
    description: 'SAP\'s official free training — modules for S/4HANA, SAP PP, SAP MM, BTP, and more. Free learning journeys.',
    rating: 4.6,
    learners: '2M+',
    highlights: ['Official SAP', 'Free modules', 'Cert prep paths'],
    badge: 'Official SAP',
    category: 'enterprise',
  },
  {
    name: 'freeCodeCamp YouTube',
    url: 'https://www.youtube.com/@freecodecamp',
    tagline: '10+ hour deep-dive courses',
    description: 'Full university-length courses on YouTube: Python, JS, Java, C++, React, ML, DevOps — among the highest-rated on the platform.',
    rating: 4.9,
    learners: '10M subs',
    highlights: ['Full courses free', 'No fluff', 'Community-vetted'],
    badge: 'YouTube #1',
    category: 'programming',
  },
  {
    name: 'TechWorld with Nana',
    url: 'https://www.youtube.com/@TechWorldwithNana',
    tagline: 'DevOps, K8s, Docker crash courses',
    description: 'The clearest explainer of Kubernetes, Docker, CI/CD on YouTube. Consistently top-recommended for DevOps beginners.',
    rating: 4.9,
    learners: '1M subs',
    highlights: ['K8s crash course', 'CI/CD tutorials', 'Very clear'],
    badge: 'DevOps Favourite',
    category: 'infrastructure',
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    tagline: 'The web\'s official reference',
    description: 'Mozilla\'s reference for HTML, CSS, JS, Web APIs. The single most-linked documentation in web development.',
    rating: 4.9,
    learners: '—',
    highlights: ['Web standards', 'Examples everywhere', 'Beginner friendly'],
    badge: 'Web Canon',
    category: 'web-dev',
  },
  {
    name: 'Roadmap.sh',
    url: 'https://roadmap.sh/',
    tagline: 'Visual role roadmaps, free',
    description: 'Open-source roadmaps for 40+ roles (Frontend, Backend, DevOps, Data Scientist, AI Engineer...). 300k+ GitHub stars.',
    rating: 4.9,
    learners: '5M+',
    highlights: ['Visual roadmaps', 'Role-specific', 'Community-maintained'],
    badge: 'GitHub Top 100',
    category: 'all-rounder',
  },
  {
    name: 'Stanford Online — Free Courses',
    url: 'https://online.stanford.edu/free-courses',
    tagline: 'Stanford lectures, free',
    description: 'Andrew Ng\'s Machine Learning, CS229, CS224N (NLP), and dozens more — freely accessible from Stanford.',
    rating: 4.9,
    learners: '20M+',
    highlights: ['Andrew Ng courses', 'Stanford faculty', 'Deep CS + ML'],
    badge: 'Stanford Faculty',
    category: 'data-ai',
  },
];

export const PLATFORM_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'all-rounder', label: 'General' },
  { key: 'computer-science', label: 'CS Fundamentals' },
  { key: 'web-dev', label: 'Web Dev' },
  { key: 'programming', label: 'Programming' },
  { key: 'data-ai', label: 'Data & AI' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'infrastructure', label: 'DevOps / SRE' },
  { key: 'database', label: 'Database' },
  { key: 'enterprise', label: 'Enterprise (SAP)' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'interview', label: 'Interview Prep' },
  { key: 'foundations', label: 'Foundations' },
];

// Short, rotating motivational messages shown in the hero banner.
export const MOTIVATION_QUOTES = [
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
  {
    quote: "One hour a day of study in your chosen field will make you an expert in five years.",
    author: "Earl Nightingale",
  },
  {
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    quote: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King",
  },
  {
    quote: "Don't wish it were easier. Wish you were better.",
    author: "Jim Rohn",
  },
  {
    quote: "Compound interest is the 8th wonder of the world — and it applies to skills too.",
    author: "Adapted from Einstein",
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
];

// Evidence-based learning tips shown in a rotating carousel.
export const LEARNING_TIPS = [
  {
    title: 'Learn in public',
    body: 'Tweet what you learn, post on LinkedIn, commit to GitHub. Recruiters find people who build in the open.',
    icon: 'Megaphone',
  },
  {
    title: 'Pair every tutorial with a project',
    body: 'Tutorials alone don\'t stick. After every course, ship something — however small — that uses the new skill.',
    icon: 'Hammer',
  },
  {
    title: 'Use the Feynman technique',
    body: 'Explain what you learned in plain English as if teaching a 12-year-old. Gaps in your understanding become obvious.',
    icon: 'Lightbulb',
  },
  {
    title: 'Aim for 45 minutes a day',
    body: '45 focused minutes daily beats a 5-hour weekend cram. Consistency compounds; binge-sessions don\'t.',
    icon: 'Clock',
  },
  {
    title: 'Study interview questions from day 1',
    body: 'Look up common questions for your target role while learning. It anchors what\'s actually important.',
    icon: 'Target',
  },
  {
    title: 'Re-read, re-watch, re-do',
    body: 'Spaced repetition beats single-exposure. Revisit hard concepts after 1 day, 1 week, 1 month.',
    icon: 'Repeat',
  },
];

// Pick a stable "quote of the day" based on date — no randomness that
// flips on re-render.
export function pickDailyMotivation() {
  const day = Math.floor(Date.now() / 86400000); // days since epoch
  return MOTIVATION_QUOTES[day % MOTIVATION_QUOTES.length];
}

export function pickDailyTip() {
  const day = Math.floor(Date.now() / 86400000);
  return LEARNING_TIPS[day % LEARNING_TIPS.length];
}

// Find the single most-relevant "next skill to learn" given a list of
// high-priority gap skills + target roles. Used for the impact banner.
export function pickNextSkill(highPriority = [], goodToHave = []) {
  return highPriority[0] || goodToHave[0] || null;
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('changeme123', 12);

  // Create Nishanth (Admin)
  const nishanth = await prisma.user.upsert({
    where: { email: 'nishanth@jobhunt.app' },
    update: {},
    create: {
      name: 'Nishanth',
      email: 'nishanth@jobhunt.app',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create Indhu (User)
  const indhu = await prisma.user.upsert({
    where: { email: 'indhu@jobhunt.app' },
    update: {},
    create: {
      name: 'Indhu',
      email: 'indhu@jobhunt.app',
      password: hashedPassword,
      role: 'USER',
    },
  });

  // Create Test/Demo account
  const demo = await prisma.user.upsert({
    where: { email: 'demo@jobhunt.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@jobhunt.app',
      password: await bcrypt.hash('demo123', 12),
      role: 'USER',
    },
  });

  // Create default preferences for main accounts
  for (const user of [nishanth, indhu]) {
    await prisma.preference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        jobRoles: JSON.stringify([]),
        locations: JSON.stringify([]),
        industries: JSON.stringify([]),
        jobType: 'any',
      },
    });
  }

  // Demo user — preferences + resume + sample job
  await prisma.preference.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      jobRoles: JSON.stringify(['Software Engineer', 'Full Stack Developer']),
      locations: JSON.stringify(['Remote', 'Toronto, ON']),
      industries: JSON.stringify(['Technology', 'SaaS']),
      jobType: 'remote',
    },
  });

  // Check if demo resume exists already
  const existingResume = await prisma.resume.findFirst({ where: { userId: demo.id } });
  if (!existingResume) {
    const demoResume = await prisma.resume.create({
      data: {
        userId: demo.id,
        fileName: 'Demo_Resume.pdf',
        filePath: '/uploads/demo_resume.pdf',
        rawText: `Demo User
Software Engineer | 5+ years experience

PROFESSIONAL SUMMARY
Experienced full-stack software engineer with 5+ years of experience building scalable web applications.
Proficient in React, Node.js, Python, and cloud services. Proven track record of delivering high-quality solutions in agile environments.

TECHNICAL SKILLS
JavaScript | TypeScript | React | Node.js | Python | SQL | PostgreSQL | MongoDB | Docker | AWS | Git | REST API | GraphQL | Agile

PROFESSIONAL EXPERIENCE

TechCorp Inc.
Senior Software Engineer  Jan 2022 - Present
• Led development of customer-facing dashboard serving 50K+ daily active users using React and Node.js
• Designed and implemented microservices architecture, reducing API response times by 40%
• Mentored 3 junior developers and conducted code reviews for the frontend team
• Implemented CI/CD pipeline using GitHub Actions, reducing deployment time from 2 hours to 15 minutes

StartupXYZ
Software Engineer  Jun 2019 - Dec 2021
• Built full-stack features using React, Express, and PostgreSQL for a B2B SaaS platform
• Developed RESTful APIs handling 10K+ requests per minute with 99.9% uptime
• Collaborated with product and design teams to deliver user-facing features on schedule
• Implemented automated testing suite achieving 85% code coverage

EDUCATION
Bachelor of Science in Computer Science
University of Toronto, Canada  2019`,
        skills: JSON.stringify(['javascript', 'typescript', 'react', 'node.js', 'python', 'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'git', 'rest api', 'graphql', 'agile']),
        experience: JSON.stringify([
          { title: 'Senior Software Engineer', company: 'TechCorp Inc.', dates: 'Jan 2022 - Present', bullets: ['Led development of customer-facing dashboard', 'Designed microservices architecture', 'Mentored junior developers'] },
          { title: 'Software Engineer', company: 'StartupXYZ', dates: 'Jun 2019 - Dec 2021', bullets: ['Built full-stack features using React, Express, PostgreSQL', 'Developed RESTful APIs', 'Implemented automated testing'] },
        ]),
        education: JSON.stringify(['Bachelor of Science in Computer Science — University of Toronto, Canada (2019)']),
        summary: 'Experienced full-stack software engineer with 5+ years of experience building scalable web applications.',
        jobTitle: 'Software Engineer',
        yearsExp: 5,
        isActive: true,
      },
    });

    // Create a sample saved job for demo
    await prisma.savedJob.create({
      data: {
        userId: demo.id,
        externalId: 'demo-sample-job-1',
        title: 'Senior Full Stack Developer',
        company: 'Shopify',
        location: 'Toronto, ON (Remote)',
        description: 'We are looking for a Senior Full Stack Developer to join our team. You will work on building scalable e-commerce solutions using React, Node.js, and GraphQL. Requirements: 5+ years of software development experience, proficiency in JavaScript/TypeScript, React, Node.js, experience with SQL and NoSQL databases, familiarity with cloud services (AWS/GCP), strong communication skills, experience with agile methodologies.',
        url: 'https://www.shopify.com/careers',
        salary: '$120,000 - $160,000 CAD',
        source: 'demo',
        companyWebsite: 'https://www.shopify.com',
        matchScore: 87,
        atsScore: 72,
        status: 'SAVED',
      },
    });
  }

  console.log('Seed complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('   Nishanth -> nishanth@jobhunt.app / changeme123');
  console.log('   Indhu    -> indhu@jobhunt.app    / changeme123');
  console.log('   Demo     -> demo@jobhunt.app     / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

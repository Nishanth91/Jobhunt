import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import CareerClient from './CareerClient';
import { analyzeSkillGap } from '@/lib/career-data';

export default async function CareerPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [resume, preference] = await Promise.all([
    prisma.resume.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.preference.findUnique({
      where: { userId },
    }),
  ]);

  // Parse data from DB
  const resumeSkills = resume ? JSON.parse(resume.skills || '[]') : [];
  const resumeJobTitle = resume?.jobTitle || '';
  const yearsExp = resume?.yearsExp || 0;
  const targetRoles = preference ? JSON.parse(preference.jobRoles || '[]') : [];

  // Run skill gap analysis
  const analysis = analyzeSkillGap(resumeSkills, targetRoles, resumeJobTitle);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Navbar title="Career Guidance" />
        <main className="flex-1 px-8 py-7">
          <CareerClient
            analysis={analysis}
            resumeSkills={resumeSkills}
            resumeJobTitle={resumeJobTitle}
            yearsExp={yearsExp}
            targetRoles={targetRoles}
            hasResume={!!resume}
            hasPreferences={targetRoles.length > 0}
          />
        </main>
      </div>
    </div>
  );
}

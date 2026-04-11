import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import JobsClient from './JobsClient';

export default async function JobsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [preference, resume, savedJobIds] = await Promise.all([
    prisma.preference.findUnique({ where: { userId } }),
    prisma.resume.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.savedJob.findMany({ where: { userId }, select: { externalId: true, id: true } }),
  ]);

  const prefData = preference
    ? {
        jobRoles: JSON.parse(preference.jobRoles || '[]'),
        locations: JSON.parse(preference.locations || '[]'),
        jobType: preference.jobType,
      }
    : { jobRoles: [], locations: [], jobType: 'any' };

  const resumeData = resume
    ? { ...resume, skills: JSON.parse(resume.skills || '[]'), yearsExp: resume.yearsExp, jobTitle: resume.jobTitle }
    : null;

  const defaultQuery = searchParams?.q || prefData.jobRoles[0] || '';
  const defaultLocation = prefData.locations[0] || '';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="Job Search" />
        <main className="flex-1 px-8 py-7">
          <JobsClient
            preference={prefData}
            resumeData={resumeData}
            savedJobIds={savedJobIds}
            defaultQuery={defaultQuery}
            defaultLocation={defaultLocation}
          />
        </main>
      </div>
    </div>
  );
}

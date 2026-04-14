import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import JobDetailClient from './JobDetailClient';

export default async function JobDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;
  const jobId = params.id;

  const [job, resume, documents] = await Promise.all([
    prisma.savedJob.findFirst({ where: { id: jobId, userId } }),
    prisma.resume.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.tailoredDocument.findMany({ where: { jobId, userId }, orderBy: { createdAt: 'desc' } }),
  ]);

  if (!job) notFound();

  const resumeData = resume
    ? { ...resume, skills: JSON.parse(resume.skills || '[]'), experience: JSON.parse(resume.experience || '[]'), education: JSON.parse(resume.education || '[]') }
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-64 flex-1 flex flex-col">
        <Navbar title={job.title} />
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7">
          <JobDetailClient
            job={job}
            resumeData={resumeData}
            documents={documents}
            userName={session.user.name}
          />
        </main>
      </div>
    </div>
  );
}

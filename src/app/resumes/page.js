import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ResumesClient from './ResumesClient';

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [resumes, documents] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tailoredDocument.findMany({
      where: { userId, type: 'RESUME' },
      include: { job: { select: { id: true, title: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const resumesData = resumes.map((r) => ({
    ...r,
    skills: JSON.parse(r.skills || '[]'),
    experience: JSON.parse(r.experience || '[]'),
    education: JSON.parse(r.education || '[]'),
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="Resumes" />
        <main className="flex-1 px-8 py-7">
          <ResumesClient resumes={resumesData} documents={documents} />
        </main>
      </div>
    </div>
  );
}

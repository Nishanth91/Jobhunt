import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import UploadClient from './UploadClient';

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

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
        <Navbar title="My Resume" />
        <main className="flex-1 px-8 py-7">
          <UploadClient resumes={resumesData} />
        </main>
      </div>
    </div>
  );
}

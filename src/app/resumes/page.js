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

  const documents = await prisma.tailoredDocument.findMany({
    where: { userId: session.user.id, type: 'RESUME' },
    include: { job: { select: { title: true, company: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="Tailored Resumes" />
        <main className="flex-1 px-8 py-7">
          <ResumesClient documents={documents} />
        </main>
      </div>
    </div>
  );
}

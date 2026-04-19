import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import TailorClient from './TailorClient';

export default async function TailorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const activeResume = await prisma.resume.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { id: true, fileName: true, skills: true, yearsExp: true, jobTitle: true },
  });

  const resume = activeResume
    ? { ...activeResume, skills: JSON.parse(activeResume.skills || '[]') }
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-64 flex-1 flex flex-col">
        <Navbar title="Customize Resume" />
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7">
          <TailorClient activeResume={resume} />
        </main>
      </div>
    </div>
  );
}

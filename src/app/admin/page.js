import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { savedJobs: true, applications: true, resumes: true } },
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="User Management" />
        <main className="flex-1 px-8 py-7">
          <AdminClient users={users} />
        </main>
      </div>
    </div>
  );
}

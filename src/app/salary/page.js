import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import SalaryClient from './SalaryClient';

export default async function SalaryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-64 flex-1 flex flex-col">
        <Navbar title="Salary Insights" />
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7">
          <SalaryClient />
        </main>
      </div>
    </div>
  );
}

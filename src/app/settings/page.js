import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="Settings" />
        <main className="flex-1 px-8 py-7">
          <SettingsClient user={{ name: session.user.name, email: session.user.email }} />
        </main>
      </div>
    </div>
  );
}

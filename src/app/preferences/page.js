import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import PreferencesClient from './PreferencesClient';

export default async function PreferencesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const preference = await prisma.preference.findUnique({
    where: { userId: session.user.id },
  });

  const data = preference
    ? {
        ...preference,
        jobRoles: JSON.parse(preference.jobRoles || '[]'),
        locations: JSON.parse(preference.locations || '[]'),
        industries: JSON.parse(preference.industries || '[]'),
      }
    : { jobRoles: [], locations: [], industries: [], jobType: 'any', minSalary: null, maxSalary: null };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Navbar title="Job Preferences" />
        <main className="flex-1 px-8 py-7">
          <PreferencesClient preference={data} />
        </main>
      </div>
    </div>
  );
}

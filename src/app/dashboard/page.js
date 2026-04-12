import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import JobCard from '@/components/JobCard';
import { Briefcase, CheckCircle, Calendar, TrendingUp, Upload, Settings, Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [savedJobs, applications, resume, preference] = await Promise.all([
    prisma.savedJob.findMany({
      where: { userId, NOT: { status: 'DISMISSED' } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.application.findMany({ where: { userId }, include: { job: true } }),
    prisma.resume.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.preference.findUnique({ where: { userId } }),
  ]);

  const totalSaved = await prisma.savedJob.count({ where: { userId, NOT: { status: 'DISMISSED' } } });
  const totalApplied = await prisma.application.count({ where: { userId } });
  const interviews = applications.filter((a) =>
    ['INTERVIEW', 'FINAL_ROUND'].includes(a.status)
  ).length;
  const offers = applications.filter((a) => a.status === 'OFFER').length;

  const avgMatch = savedJobs.length > 0
    ? Math.round(savedJobs.reduce((s, j) => s + j.matchScore, 0) / savedJobs.length)
    : 0;

  const pipeline = [
    { status: 'APPLIED', label: 'Applied', count: applications.filter((a) => a.status === 'APPLIED').length, color: 'bg-blue-500', jobs: applications.filter((a) => a.status === 'APPLIED') },
    { status: 'SCREENING', label: 'Screening', count: applications.filter((a) => a.status === 'SCREENING').length, color: 'bg-cyan-500', jobs: applications.filter((a) => a.status === 'SCREENING') },
    { status: 'INTERVIEW', label: 'Interview', count: applications.filter((a) => ['INTERVIEW', 'FINAL_ROUND'].includes(a.status)).length, color: 'bg-amber-500', jobs: applications.filter((a) => ['INTERVIEW', 'FINAL_ROUND'].includes(a.status)) },
    { status: 'OFFER', label: 'Offer', count: applications.filter((a) => a.status === 'OFFER').length, color: 'bg-emerald-500', jobs: applications.filter((a) => a.status === 'OFFER') },
  ];

  const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0) || 1;

  const hasResume = !!resume;
  const hasPreferences = preference && JSON.parse(preference.jobRoles || '[]').length > 0;
  const userName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Navbar title="Dashboard" />
        <main className="flex-1 px-8 py-7 space-y-8">

          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/8 to-teal-500/10 border border-teal-500/20 p-6">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-teal-400" />
                    Welcome back, {userName}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {hasResume && hasPreferences
                      ? `You have ${totalSaved} saved jobs and ${totalApplied} applications in progress.`
                      : 'Complete your profile to get personalised job matches.'}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  {!hasResume && (
                    <Link href="/upload" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium hover:shadow-glow transition-all">
                      <Upload size={14} /> Upload Resume
                    </Link>
                  )}
                  {!hasPreferences && (
                    <Link href="/preferences" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 border border-cyan-500/20 transition-all">
                      <Settings size={14} /> Set Preferences
                    </Link>
                  )}
                  {hasResume && hasPreferences && (
                    <Link href="/jobs" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium hover:shadow-glow transition-all">
                      <Zap size={14} /> Search Jobs <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon={Briefcase} label="Jobs Saved" value={totalSaved} sub="Total positions" color="teal" />
            <StatsCard icon={CheckCircle} label="Applications" value={totalApplied} sub="Sent out" color="blue" />
            <StatsCard icon={Calendar} label="Interviews" value={interviews} sub="In progress" color="cyan" />
            <StatsCard icon={TrendingUp} label="Match Score" value={`${avgMatch}%`} sub="Avg. fit" color="emerald" />
          </div>

          {/* Pipeline Progress Bar */}
          {totalApplied > 0 && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target size={14} className="text-teal-400" /> Application Pipeline
                </h3>
                <span className="text-xs text-slate-500">{totalApplied} total</span>
              </div>
              {/* Progress bar */}
              <div className="flex h-3 rounded-full overflow-hidden bg-white/5 mb-4">
                {pipeline.map(({ status, color, count }) => (
                  count > 0 && (
                    <div
                      key={status}
                      className={`${color} transition-all duration-500`}
                      style={{ width: `${(count / pipelineTotal) * 100}%` }}
                      title={`${status}: ${count}`}
                    />
                  )
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-6 flex-wrap">
                {pipeline.map(({ label, color, count }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Recent Saved Jobs */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Recent Saved Jobs</h3>
                <Link href="/jobs" className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium">
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {savedJobs.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-teal-400" />
                  </div>
                  <p className="text-slate-300 font-medium">No jobs saved yet</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Search for positions that match your skills and save them to track your progress</p>
                  <Link href="/jobs" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium hover:shadow-glow transition-all">
                    <Zap size={14} /> Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedJobs.map((job) => (
                    <JobCard key={job.id} job={job} saved showATS />
                  ))}
                </div>
              )}
            </div>

            {/* Application Pipeline Details */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Pipeline Stages</h3>
              <div className="space-y-3">
                {pipeline.map(({ status, label, color, count, jobs }) => (
                  <div key={status} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${color} ${count > 0 ? 'pulse-dot' : ''}`} />
                        <span className="text-sm font-medium text-slate-300">{label}</span>
                      </div>
                      <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs text-slate-400 font-bold">
                        {count}
                      </span>
                    </div>
                    {jobs.length > 0 ? (
                      <div className="space-y-2">
                        {jobs.slice(0, 2).map(({ job, id }) => (
                          <Link key={id} href={`/jobs/${job.id}`} className="block p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                            <p className="text-xs font-medium text-white line-clamp-1">{job.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{job.company}</p>
                          </Link>
                        ))}
                        {jobs.length > 2 && (
                          <p className="text-xs text-slate-600 text-center py-1">+{jobs.length - 2} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">None yet</p>
                    )}
                  </div>
                ))}
              </div>

              {offers > 0 && (
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-4 text-center">
                  <p className="text-emerald-300 font-bold text-lg">{offers} Offer{offers > 1 ? 's' : ''}!</p>
                  <p className="text-xs text-emerald-400/70 mt-1">Congratulations!</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/jobs" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-sm text-slate-300 transition-colors">
                    <Briefcase size={14} className="text-teal-400" /> Search new jobs
                  </Link>
                  <Link href="/upload" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-sm text-slate-300 transition-colors">
                    <Upload size={14} className="text-cyan-400" /> Update resume
                  </Link>
                  <Link href="/career" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-sm text-slate-300 transition-colors">
                    <Sparkles size={14} className="text-amber-400" /> Career guidance
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

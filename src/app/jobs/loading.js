import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function JobsLoading() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Navbar title="Find Jobs" />
        <main className="flex-1 px-8 py-7 space-y-6 animate-pulse">
          {/* Search bar skeleton */}
          <div className="h-14 rounded-2xl bg-white/[0.03] border border-white/5" />
          {/* Filter row skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-28 rounded-xl bg-white/[0.03] border border-white/5" />
            ))}
          </div>
          {/* Job cards skeleton */}
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/5" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

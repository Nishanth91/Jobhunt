import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Navbar title="Dashboard" />
        <main className="flex-1 px-8 py-7 space-y-8 animate-pulse">
          {/* Welcome banner skeleton */}
          <div className="h-28 rounded-2xl bg-white/[0.03] border border-white/5" />
          {/* Stats row skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/5" />
            ))}
          </div>
          {/* Pipeline skeleton */}
          <div className="h-24 rounded-2xl bg-white/[0.03] border border-white/5" />
          {/* Content skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-white/5" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/5" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

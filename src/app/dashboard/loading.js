export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-[#050510] border-r border-white/5" />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Navbar placeholder */}
        <div className="h-16 border-b border-white/5" />
        <main className="flex-1 px-8 py-7 space-y-8 animate-pulse">
          <div className="h-28 rounded-2xl bg-white/[0.03] border border-white/5" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/5" />
            ))}
          </div>
          <div className="h-24 rounded-2xl bg-white/[0.03] border border-white/5" />
        </main>
      </div>
    </div>
  );
}

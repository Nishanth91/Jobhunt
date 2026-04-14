export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — uses same bg as real sidebar so no flash */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/5" />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Navbar placeholder */}
        <div className="h-16 border-b border-white/5" />
        <main className="flex-1 px-8 py-7 space-y-8 animate-pulse">
          <div className="h-28 rounded-2xl skeleton" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
          <div className="h-24 rounded-2xl skeleton" />
        </main>
      </div>
    </div>
  );
}

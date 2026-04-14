export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — hidden on mobile, visible on md+ */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/5" />
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Navbar placeholder */}
        <div className="h-14 md:h-16 border-b border-white/5" />
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-6 md:space-y-8 animate-pulse">
          <div className="h-24 md:h-28 rounded-2xl skeleton" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 md:h-28 rounded-2xl skeleton" />
            ))}
          </div>
          <div className="h-24 rounded-2xl skeleton" />
        </main>
      </div>
    </div>
  );
}

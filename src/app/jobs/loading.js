export default function JobsLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/5" />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <div className="h-16 border-b border-white/5" />
        <main className="flex-1 px-8 py-7 space-y-6 animate-pulse">
          <div className="h-14 rounded-2xl skeleton" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-28 rounded-xl skeleton" />
            ))}
          </div>
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 rounded-2xl skeleton" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResumesLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/5" />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <div className="h-16 border-b border-white/5" />
        <main className="flex-1 px-8 py-7 space-y-6 animate-pulse">
          <div className="h-16 rounded-2xl skeleton" />
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-xl skeleton" />
            <div className="h-10 w-32 rounded-xl skeleton" />
          </div>
          <div className="h-48 rounded-2xl skeleton" />
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl skeleton" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

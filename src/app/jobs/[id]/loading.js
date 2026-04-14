export default function JobDetailLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-white/5" />
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <div className="h-14 md:h-16 border-b border-white/5" />
        <main className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-6 animate-pulse">
          <div className="max-w-5xl space-y-6">
            <div className="h-44 md:h-56 rounded-2xl skeleton" />
            <div className="flex gap-2 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-28 rounded-xl skeleton flex-shrink-0" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 rounded-2xl skeleton" />
              <div className="h-48 rounded-2xl skeleton" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

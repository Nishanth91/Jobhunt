'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Navbar({ title = '' }) {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-md border-b border-white/5 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">{title || `${greeting}, ${session?.user?.name?.split(' ')[0]} 👋`}</h2>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs by title, skill, or company..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all">
            <Bell size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

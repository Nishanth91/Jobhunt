'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Briefcase, Settings, FileText, Sparkles,
  LogOut, Users, ChevronRight, UserCog, GraduationCap, DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/client-cache';
import { useSidebar } from './SidebarProvider';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/resumes', icon: FileText, label: 'Resumes' },
  { href: '/tailor', icon: Sparkles, label: 'Customize Resume' },
  { href: '/preferences', icon: Settings, label: 'Preferences' },
  { href: '/career', icon: GraduationCap, label: 'Career Guidance' },
  { href: '/salary', icon: DollarSign, label: 'Salary Insights' },
  { href: '/settings', icon: UserCog, label: 'Account Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [avatar, setAvatar] = useState(null);
  const { open, close } = useSidebar();

  useEffect(() => {
    if (session?.user?.hasAvatar) {
      cachedFetch('/api/users/avatar', undefined, 10 * 60000)
        .then((d) => { if (d.avatar) setAvatar(d.avatar); })
        .catch(() => {});
    }
  }, [session?.user?.hasAvatar]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col bg-navy-800 border-r border-white/5 z-50 transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-glow-sm">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">JobHunt</h1>
              <p className="text-[10px] text-slate-500">Your Career Command Center</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
              {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-teal-400/50" />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-2 px-3">
                <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Admin</p>
              </div>
              <Link
                href="/admin"
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  pathname === '/admin'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={16} className="text-slate-500 group-hover:text-slate-300" />
                Manage Users
              </Link>
            </>
          )}
        </nav>

        {/* Sign Out */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

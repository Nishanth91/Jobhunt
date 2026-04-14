'use client';

import { useState } from 'react';
import { Plus, Trash2, Users, Briefcase, FileText, CheckCircle, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function AdminClient({ users }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowAddForm(false);
      setForm({ name: '', email: '', password: '', role: 'USER' });
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Remove user "${name}" and all their data? This cannot be undone.`)) return;
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">User Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} users · Each user's data is kept completely separate</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium hover:from-teal-600 hover:to-cyan-700 transition-all shadow-glow-sm"
        >
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-teal-500/20 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Add New User</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full px-3 pr-9 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:border-teal-500/50 transition-all"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd} disabled={adding}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all disabled:opacity-50">
              {adding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Create User
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl text-slate-400 text-sm hover:text-slate-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        {/* Table header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-5 px-5 py-3 border-b border-white/5 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span className="col-span-2">User</span>
          <span>Jobs Saved</span>
          <span>Applied</span>
          <span>Joined</span>
        </div>

        {users.map((user) => (
          <div key={user.id} className="flex flex-col md:grid md:grid-cols-5 px-4 md:px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors md:items-center gap-3 md:gap-0">
            <div className="md:col-span-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                {user.role === 'ADMIN' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">ADMIN</span>
                )}
              </div>
              {/* Delete button — inline on mobile */}
              <button
                onClick={() => handleDelete(user.id, user.name)}
                className="md:hidden w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0"
                title="Delete user"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="flex items-center gap-4 md:contents pl-12 md:pl-0">
              <div className="flex items-center gap-1 text-sm text-slate-300">
                <Briefcase size={12} className="text-slate-500" /> {user._count.savedJobs} <span className="md:hidden text-xs text-slate-500">saved</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-300">
                <FileText size={12} className="text-slate-500" /> {user._count.applications} <span className="md:hidden text-xs text-slate-500">applied</span>
              </div>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="hidden md:flex items-center justify-end">
              <button
                onClick={() => handleDelete(user.id, user.name)}
                className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                title="Delete user"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

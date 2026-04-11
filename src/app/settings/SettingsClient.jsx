'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react';

export default function SettingsClient({ user }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (key) => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account details</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User size={15} className="text-indigo-400" /> Profile
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Lock size={15} className="text-indigo-400" /> Change Password
        </h3>

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            <CheckCircle size={16} /> Password changed successfully!
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleShow('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPw.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleShow('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

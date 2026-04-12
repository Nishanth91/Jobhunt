'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, User, Camera, Trash2, Palette, Sun, Moon, Link2, Phone, Mail, MapPin } from 'lucide-react';
import { useTheme, COLOR_SCHEMES } from '@/components/ThemeProvider';

export default function SettingsClient({ user }) {
  const { theme, colorScheme, toggle: toggleTheme, setColorScheme } = useTheme();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const fileRef = useRef(null);

  // Contact info state
  const [contact, setContact] = useState({ linkedIn: '', phone: '', contactEmail: '', city: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactMsg, setContactMsg] = useState('');

  // Load avatar + contact info on mount
  useEffect(() => {
    fetch('/api/users/avatar')
      .then((r) => r.json())
      .then((data) => { if (data.avatar) setAvatar(data.avatar); })
      .catch(() => {});
    fetch('/api/users/profile')
      .then((r) => r.json())
      .then((data) => {
        setContact({
          linkedIn: data.linkedIn || '',
          phone: data.phone || '',
          contactEmail: data.contactEmail || '',
          city: data.city || '',
        });
      })
      .catch(() => {});
  }, []);

  const handleSaveContact = async () => {
    setSavingContact(true);
    setContactMsg('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),  // includes city
      });
      if (res.ok) {
        setContactSaved(true);
        setContactMsg('Saved!');
        setTimeout(() => { setContactSaved(false); setContactMsg(''); }, 3000);
      }
    } catch {
      setContactMsg('Failed to save');
    } finally {
      setSavingContact(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Please select an image file');
      return;
    }
    if (file.size > 500 * 1024) {
      setAvatarMsg('Image must be under 500KB');
      return;
    }

    setAvatarLoading(true);
    setAvatarMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const res = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (res.ok) {
          setAvatar(base64);
          setAvatarMsg('Photo updated!');
        } else {
          const data = await res.json();
          setAvatarMsg(data.error || 'Upload failed');
        }
      } catch {
        setAvatarMsg('Upload failed');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    setAvatarLoading(true);
    try {
      await fetch('/api/users/avatar', { method: 'DELETE' });
      setAvatar(null);
      setAvatarMsg('Photo removed');
    } catch {
      setAvatarMsg('Failed to remove');
    } finally {
      setAvatarLoading(false);
    }
  };

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

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account details</p>
      </div>

      {/* Profile Info + Avatar Upload */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User size={15} className="text-teal-400" /> Profile
        </h3>
        <div className="flex items-center gap-5">
          {/* Avatar with upload overlay */}
          <div className="relative">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="avatar-upload w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-[#050510]"
            >
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              <div className="avatar-overlay">
                {avatarLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <Camera size={18} className="text-white" />}
              </div>
            </button>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                {avatar ? 'Change photo' : 'Upload photo'}
              </button>
              {avatar && (
                <button
                  onClick={removeAvatar}
                  disabled={avatarLoading}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <Trash2 size={10} /> Remove
                </button>
              )}
            </div>
            {avatarMsg && (
              <p className={`text-xs mt-1 ${avatarMsg.includes('failed') || avatarMsg.includes('Please') || avatarMsg.includes('must') ? 'text-red-400' : 'text-emerald-400'}`}>
                {avatarMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Link2 size={15} className="text-teal-400" /> Contact Info
        </h3>
        <p className="text-xs text-slate-500 mb-4">Saved once — auto-applied to every resume header you generate.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Link2 size={11} /> LinkedIn URL
            </label>
            <input
              type="url"
              value={contact.linkedIn}
              onChange={(e) => setContact((c) => ({ ...c, linkedIn: e.target.value }))}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Phone size={11} /> Phone Number
            </label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              placeholder="+1 (204) 555-0100"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail size={11} /> Contact Email
            </label>
            <input
              type="email"
              value={contact.contactEmail}
              onChange={(e) => setContact((c) => ({ ...c, contactEmail: e.target.value }))}
              placeholder="you@email.com"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin size={11} /> City
            </label>
            <input
              type="text"
              value={contact.city}
              onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}
              placeholder="Winnipeg, MB"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveContact}
            disabled={savingContact}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 disabled:opacity-60 transition-all"
          >
            {savingContact ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : contactSaved ? <><CheckCircle size={14} /> Saved!</> : 'Save Contact Info'}
          </button>
          {contactMsg && !savingContact && (
            <p className={`text-xs ${contactSaved ? 'text-emerald-400' : 'text-red-400'}`}>{contactMsg}</p>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Palette size={15} className="text-teal-400" /> Appearance
        </h3>

        {/* Dark / Light toggle */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-white font-medium">Theme Mode</p>
            <p className="text-xs text-slate-500 mt-0.5">Switch between dark and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            {theme === 'dark' ? <><Moon size={14} /> Dark</> : <><Sun size={14} /> Light</>}
          </button>
        </div>

        {/* Color scheme swatches */}
        <div>
          <p className="text-sm text-white font-medium mb-3">Accent Color</p>
          <div className="flex flex-wrap gap-3">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id)}
                title={scheme.label}
                className={`flex flex-col items-center gap-1.5 group`}
              >
                <div
                  className={`w-10 h-10 rounded-xl transition-all ring-offset-2 ring-offset-[#050510] ${
                    colorScheme === scheme.id ? 'ring-2 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})`,
                    ringColor: scheme.primary,
                    boxShadow: colorScheme === scheme.id ? `0 0 12px ${scheme.primary}60` : 'none',
                  }}
                />
                <span className={`text-[10px] font-medium transition-colors ${colorScheme === scheme.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {scheme.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Lock size={15} className="text-teal-400" /> Change Password
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
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-teal-500/50 transition-all"
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
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-teal-500/50 transition-all"
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
                className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-teal-500/50 transition-all"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

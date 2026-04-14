'use client';

import { useState, useEffect, useRef } from 'react';
import { cachedFetch, cacheDelete } from '@/lib/client-cache';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, User, Camera, Trash2, Palette, Sun, Moon, Link2, Phone, Mail, MapPin, UserCircle2 } from 'lucide-react';
import { useTheme, COLOR_SCHEMES } from '@/components/ThemeProvider';

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon size={11} />} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 focus:outline-none transition-all"
      />
    </div>
  );
}

export default function SettingsClient({ user }) {
  const { theme, colorScheme, toggle: toggleTheme, setColorScheme } = useTheme();

  // Password form
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Avatar
  const [avatar, setAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const fileRef = useRef(null);

  // Profile (name + contact)
  const [profile, setProfile] = useState({
    name: user.name || '',
    linkedIn: '',
    phone: '',
    contactEmail: '',
    city: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    cachedFetch('/api/users/avatar', undefined, 10 * 60000)
      .then((d) => { if (d.avatar) setAvatar(d.avatar); })
      .catch(() => {});
    cachedFetch('/api/users/profile', undefined, 5 * 60000)
      .then((d) => {
        setProfile({
          name: d.name || user.name || '',
          linkedIn: d.linkedIn || '',
          phone: d.phone || '',
          contactEmail: d.contactEmail || '',
          city: d.city || '',
        });
      })
      .catch(() => {});
  }, [user.name]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setProfileSaved(true);
        setProfileMsg('Saved!');
        // Bust cache so next visit re-fetches fresh data
        cacheDelete('/api/users/profile');
        cacheDelete('/api/users/avatar');
        setTimeout(() => { setProfileSaved(false); setProfileMsg(''); }, 3000);
      } else {
        setProfileMsg('Failed to save');
      }
    } catch {
      setProfileMsg('Failed to save');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarMsg('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarMsg('Image must be under 5MB'); return; }

    setAvatarLoading(true);
    setAvatarMsg('');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: reader.result }),
        });
        if (res.ok) { setAvatar(reader.result); setAvatarMsg('Photo updated!'); }
        else { const d = await res.json(); setAvatarMsg(d.error || 'Upload failed'); }
      } catch { setAvatarMsg('Upload failed'); }
      finally { setAvatarLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    setAvatarLoading(true);
    try { await fetch('/api/users/avatar', { method: 'DELETE' }); setAvatar(null); setAvatarMsg('Photo removed'); }
    catch { setAvatarMsg('Failed to remove'); }
    finally { setAvatarLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (form.newPassword !== form.confirmPassword) { setPwError('New passwords do not match'); return; }
    if (form.newPassword.length < 8) { setPwError('New password must be at least 8 characters'); return; }

    setPwLoading(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPwSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const toggleShow = (key) => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));
  const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Account Settings</h2>
        <p className="text-sm text-slate-400">Manage your profile, contact info, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Profile Card */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <UserCircle2 size={15} className="text-teal-400" /> Profile
            </h3>

            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.06]">
              <div className="relative">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarLoading}
                  className="avatar-upload w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-[#050510]"
                >
                  {avatar ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" /> : initials}
                  <div className="avatar-overlay">
                    {avatarLoading ? <Loader2 size={16} className="animate-spin text-white" /> : <Camera size={16} className="text-white" />}
                  </div>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.name || user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => fileRef.current?.click()} disabled={avatarLoading} className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors">
                    {avatar ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatar && (
                    <button onClick={removeAvatar} disabled={avatarLoading} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                      <Trash2 size={10} /> Remove
                    </button>
                  )}
                </div>
                {avatarMsg && <p className={`text-xs mt-1 ${avatarMsg.includes('fail') || avatarMsg.includes('Please') || avatarMsg.includes('must') ? 'text-red-400' : 'text-emerald-400'}`}>{avatarMsg}</p>}
              </div>
            </div>

            {/* Full Name field */}
            <Field
              label="Full Name"
              icon={User}
              value={profile.name}
              onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
              placeholder="Your full name (used on resumes)"
            />
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Link2 size={15} className="text-teal-400" /> Contact Info
            </h3>
            <p className="text-xs text-slate-500 mb-5">Auto-applied to every resume header you generate.</p>

            <div className="space-y-4">
              <Field label="LinkedIn URL" icon={Link2} type="url" value={profile.linkedIn} onChange={(v) => setProfile((p) => ({ ...p, linkedIn: v }))} placeholder="https://linkedin.com/in/yourprofile" />
              <Field label="Phone Number" icon={Phone} type="tel" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} placeholder="+1 (204) 555-0100" />
              <Field label="Contact Email" icon={Mail} type="email" value={profile.contactEmail} onChange={(v) => setProfile((p) => ({ ...p, contactEmail: v }))} placeholder="you@email.com" />
              <Field label="City" icon={MapPin} value={profile.city} onChange={(v) => setProfile((p) => ({ ...p, city: v }))} placeholder="Winnipeg, MB" />
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 disabled:opacity-60 transition-all"
              >
                {savingProfile ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : profileSaved ? <><CheckCircle size={14} /> Saved!</> : 'Save Profile & Contact'}
              </button>
              {profileMsg && !savingProfile && (
                <p className={`text-xs ${profileSaved ? 'text-emerald-400' : 'text-red-400'}`}>{profileMsg}</p>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* Appearance */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <Palette size={15} className="text-teal-400" /> Appearance
            </h3>

            {/* Dark / Light toggle */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/[0.06]">
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

            {/* Color swatches */}
            <div>
              <p className="text-sm text-white font-medium mb-3">Accent Color</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    title={scheme.label}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl transition-all ring-offset-2 ring-offset-[#050510] ${
                        colorScheme === scheme.id ? 'ring-2 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})`,
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

            {pwSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                <CheckCircle size={16} /> Password changed successfully!
              </div>
            )}
            {pwError && (
              <div className="flex items-center gap-2.5 p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertCircle size={16} /> {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                { key: 'newPassword', label: 'New Password', placeholder: 'Min. 8 characters' },
                { key: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required
                      placeholder={placeholder}
                      className="w-full px-3.5 py-2.5 pr-11 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:border-teal-500/50 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleShow(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {pwLoading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

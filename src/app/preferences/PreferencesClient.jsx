'use client';

import { useState } from 'react';
import { Plus, X, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const JOB_TYPES = [
  { value: 'any', label: 'Any' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'contract', label: 'Contract' },
];

const SUGGESTED_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Data Analyst',
  'Machine Learning Engineer', 'Project Manager', 'Business Analyst', 'Marketing Manager',
];

const SUGGESTED_LOCATIONS = [
  'New York', 'San Francisco', 'Austin', 'Seattle', 'Chicago', 'Boston',
  'Los Angeles', 'Remote', 'London', 'Toronto', 'Sydney', 'Bangalore',
];

export default function PreferencesClient({ preference }) {
  const router = useRouter();
  const [form, setForm] = useState(preference);
  const [roleInput, setRoleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addTag = (field, value) => {
    const v = value.trim();
    if (!v || form[field].includes(v)) return;
    setForm((f) => ({ ...f, [field]: [...f[field], v] }));
    if (field === 'jobRoles') setRoleInput('');
    if (field === 'locations') setLocationInput('');
  };

  const removeTag = (field, value) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((t) => t !== value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Job Preferences</h2>
        <p className="text-sm text-slate-400">These preferences power your job matches and search defaults.</p>
      </div>

      <div className="space-y-6">
        {/* Job Roles */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Job Roles I'm Looking For</h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
            {form.jobRoles.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 text-xs border border-teal-500/30">
                {tag}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeTag('jobRoles', tag)}
                  className="hover:text-red-300 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('jobRoles', roleInput); } }}
              placeholder="e.g. Software Engineer"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag('jobRoles', roleInput)}
              className="px-3 py-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/20 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_ROLES.filter((s) => !form.jobRoles.includes(s)).slice(0, 8).map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag('jobRoles', s)}
                className="px-2.5 py-1 rounded-lg text-xs text-slate-400 bg-white/[0.03] border border-white/5 hover:border-teal-500/30 hover:text-teal-300 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Preferred Locations</h3>

          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
            {form.locations.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 text-xs border border-teal-500/30">
                {tag}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => removeTag('locations', tag)}
                  className="hover:text-red-300 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('locations', locationInput); } }}
              placeholder="e.g. New York, Remote"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag('locations', locationInput)}
              className="px-3 py-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/20 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_LOCATIONS.filter((s) => !form.locations.includes(s)).slice(0, 8).map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag('locations', s)}
                className="px-2.5 py-1 rounded-lg text-xs text-slate-400 bg-white/[0.03] border border-white/5 hover:border-teal-500/30 hover:text-teal-300 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Employment Type</h3>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setForm((f) => ({ ...f, jobType: value }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.jobType === value
                    ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40'
                    : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Salary */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Salary Range (Annual, $)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Minimum</label>
              <input
                type="number"
                value={form.minSalary || ''}
                onChange={(e) => setForm((f) => ({ ...f, minSalary: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 80000"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Maximum</label>
              <input
                type="number"
                value={form.maxSalary || ''}
                onChange={(e) => setForm((f) => ({ ...f, maxSalary: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-cyan-700 disabled:opacity-60 transition-all shadow-glow-sm"
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> :
         saved  ? <><CheckCircle size={16} /> Saved!</> :
                  <><Save size={16} /> Save Preferences</>}
      </button>
    </div>
  );
}

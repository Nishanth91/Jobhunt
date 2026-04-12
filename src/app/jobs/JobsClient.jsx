'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2, RefreshCw, MapPin, Briefcase } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { useRouter } from 'next/navigation';

const SOURCES = ['all', 'jsearch', 'google', 'adzuna', 'remotive', 'jobicy', 'themuse'];
const JOB_TYPES = ['any', 'remote', 'full-time', 'part-time', 'contract'];

export default function JobsClient({ preference, resumeData, savedJobIds, defaultQuery, defaultLocation }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const [source, setSource] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const savedSet = new Set(savedJobIds.map((j) => j.externalId).filter(Boolean));

  // Load dismissed IDs once on mount
  useEffect(() => {
    fetch('/api/jobs/dismiss')
      .then((r) => r.json())
      .then((ids) => {
        if (Array.isArray(ids)) setDismissedIds(new Set(ids));
      })
      .catch(() => {});
  }, []);

  const search = useCallback(async (q = query, loc = location, src = source) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ q, location: loc, source: src });
      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed');

      // Filter dismissed jobs client-side
      const filtered = (data.jobs || []).filter((job) => !dismissedIds.has(job.externalId));

      setJobs(filtered);
      setTotal(data.total || 0);
      setSearched(true);

      // Show source breakdown
      const src_counts = data.sources || {};
      const active = Object.entries(src_counts).filter(([, n]) => n > 0).map(([k, n]) => `${k}: ${n}`).join(', ');
      if (active) console.log('[Search] Sources:', active);

      if (data.debug?.adzunaConfigured === false && !data.sources?.jsearch && !data.sources?.google) {
        setError('No primary API keys set — only free sources (Remotive, Jobicy, The Muse) shown. Add JSEARCH_API_KEY or SERPAPI_KEY to .env.local for more results.');
      } else if (data.adzunaError && !data.sources?.jsearch && !data.sources?.google) {
        setError(`Adzuna: ${data.adzunaError}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, location, source, dismissedIds]);

  // Auto-search if user has preferences
  useEffect(() => {
    if (defaultQuery) search(defaultQuery, defaultLocation, 'all');
  }, []);

  const handleSave = async (job) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (res.ok) {
      const saved = await res.json();
      router.refresh();
      return saved;
    }
  };

  const handleUnsave = async (job) => {
    const saved = savedJobIds.find((s) => s.externalId === job.externalId);
    if (saved) {
      await fetch(`/api/jobs/${saved.id}`, { method: 'DELETE' });
      router.refresh();
    }
  };

  const handleDismiss = async (job) => {
    const payload = job.id
      ? { jobId: job.id }          // saved job → mark DISMISSED in DB
      : { externalId: job.externalId }; // search result → store in DismissedJob

    await fetch('/api/jobs/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Add to local dismissed set so it stays hidden this session
    setDismissedIds((prev) => new Set([...prev, job.externalId]));
    // Remove from jobs list
    setJobs((prev) => prev.filter((j) => j.externalId !== job.externalId && j.id !== job.id));
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Job title, skill, or keyword..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-teal-500/50 transition-all"
            />
          </div>
          <div className="flex-1 relative sm:max-w-xs">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="City, state, or 'Remote'..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-teal-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium disabled:opacity-50 hover:from-teal-600 hover:to-cyan-700 transition-all flex-shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={12} className="text-slate-500" />
            <span className="text-xs text-slate-500">Source:</span>
            <div className="flex gap-1 flex-wrap">
              {SOURCES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    source === s
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-500/30'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quick role suggestions from preferences */}
          {preference.jobRoles.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-600">Quick:</span>
              {preference.jobRoles.slice(0, 3).map((role) => (
                <button
                  key={role}
                  onClick={() => { setQuery(role); search(role, location, source); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-slate-400 border border-white/5 hover:border-teal-500/30 hover:text-teal-300 transition-all"
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm p-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">{jobs.length}</span> jobs found
              {total > jobs.length && ` (of ${total} total)`}
              {!resumeData && <span className="text-amber-400 ml-2">• Upload a resume to see match scores</span>}
            </p>
            <button
              onClick={() => search()}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.externalId || job.id}
                job={job}
                saved={savedSet.has(job.externalId)}
                onSave={handleSave}
                onUnsave={handleUnsave}
                onDismiss={handleDismiss}
                showATS={!!resumeData}
              />
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-16">
              <Briefcase size={40} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No jobs found</p>
              <p className="text-sm text-slate-500 mt-1">Try different keywords or add API keys to .env.local for more sources</p>
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-5">
            <Search size={32} className="text-teal-400" />
          </div>
          <p className="text-white font-semibold text-lg">Start your job search</p>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Enter a job title above. We search JSearch, Google Jobs, Adzuna, Remotive, Jobicy, and The Muse simultaneously.
          </p>
        </div>
      )}
    </div>
  );
}

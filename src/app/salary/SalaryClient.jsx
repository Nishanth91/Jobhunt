'use client';

import { useState } from 'react';
import {
  DollarSign, MapPin, Briefcase, TrendingUp, Search, BarChart3, Globe,
} from 'lucide-react';

const CURRENCY_SYMBOLS = { USD: '$', CAD: 'C$', GBP: '£' };

function fmt(amount, currency = 'USD') {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US')}`;
}

function SalaryBar({ label, min, median, max, currency, isPrimary, maxValue }) {
  const barWidth = maxValue ? Math.round((median / maxValue) * 100) : 100;

  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      isPrimary
        ? 'bg-indigo-500/[0.06] border-indigo-500/20'
        : 'bg-white/[0.02] border-white/10'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">{label}</span>
          {isPrimary && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Your Region
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{currency}</span>
      </div>

      {/* Salary range bar */}
      <div className="relative h-3 rounded-full bg-white/[0.04] mb-4 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Min / Median / Max */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Min</p>
          <p className="text-sm font-semibold text-slate-300">{fmt(min, currency)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Median</p>
          <p className="text-sm font-bold text-emerald-400">{fmt(median, currency)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Max</p>
          <p className="text-sm font-semibold text-slate-300">{fmt(max, currency)}</p>
        </div>
      </div>
    </div>
  );
}

function ComparisonChart({ regions }) {
  // Find global max median across all regions for proportional bars
  const maxMedian = Math.max(...regions.map((r) => r.median));

  const barColors = [
    'from-indigo-500 to-violet-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
  ];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-semibold text-white">Median Salary Comparison</h3>
      </div>

      <div className="space-y-4">
        {regions.map((r, i) => {
          const pct = Math.round((r.median / maxMedian) * 100);
          return (
            <div key={r.region}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-300">{r.region}</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {fmt(r.median, r.currency)}
                </span>
              </div>
              <div className="h-5 rounded-lg bg-white/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-lg bg-gradient-to-r ${barColors[i % barColors.length]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 mt-4">
        Note: Values are in local currencies and not directly comparable across regions without exchange-rate conversion.
      </p>
    </div>
  );
}

export default function SalaryClient() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const params = new URLSearchParams({ role: role.trim() });
      if (location.trim()) params.set('location', location.trim());

      const res = await fetch(`/api/salary?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Something went wrong');
        return;
      }

      setData(json);
    } catch {
      setError('Failed to fetch salary data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Find global max across all regions for proportional bar widths
  const maxValue = data
    ? Math.max(...data.allRegions.map((r) => r.max))
    : 0;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Salary Lookup</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Job title (e.g. Software Engineer)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors [data-theme='light']_&:bg-slate-100 [data-theme='light']_&:text-slate-900"
            />
          </div>

          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Region (e.g. US, Canada, UK, Remote)"
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !role.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Matched role badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-400">Showing results for</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              {data.matchedRole}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-sm font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {data.matchedRegion}
            </span>
          </div>

          {/* Primary salary card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.04] border border-indigo-500/20 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">
                {data.matchedRole} &mdash; {data.primary.region}
              </h3>
            </div>

            {/* Visual salary range */}
            <div className="mb-6">
              <div className="relative h-4 rounded-full bg-white/[0.04] overflow-hidden">
                {/* Full range bar */}
                <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-indigo-500/30 to-violet-500/30"
                  style={{ left: '0%', right: '0%' }} />
                {/* Median marker */}
                <div
                  className="absolute inset-y-0 w-1 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/30"
                  style={{ left: `${((data.primary.median - data.primary.min) / (data.primary.max - data.primary.min)) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${((data.primary.median - data.primary.min) / (data.primary.max - data.primary.min)) * 100}%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">Min</span>
                <span className="text-xs text-emerald-400 font-medium">Median</span>
                <span className="text-xs text-slate-500">Max</span>
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Minimum</p>
                <p className="text-lg font-bold text-slate-300">
                  {fmt(data.primary.min, data.primary.currency)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1">Median</p>
                <p className="text-lg font-bold text-emerald-400">
                  {fmt(data.primary.median, data.primary.currency)}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Maximum</p>
                <p className="text-lg font-bold text-slate-300">
                  {fmt(data.primary.max, data.primary.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Regional comparison cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-semibold text-white">Regional Breakdown</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.allRegions.map((r) => (
                <SalaryBar
                  key={r.region}
                  label={r.region}
                  min={r.min}
                  median={r.median}
                  max={r.max}
                  currency={r.currency}
                  isPrimary={r.isPrimary}
                  maxValue={maxValue}
                />
              ))}
            </div>
          </div>

          {/* Bar chart comparison */}
          <ComparisonChart regions={data.allRegions} />
        </div>
      )}

      {/* Empty state */}
      {!data && !error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
            <BarChart3 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Salary Insights</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Enter a role to see salary insights across regions. Compare minimum, median, and maximum compensation for common tech and business roles.
          </p>
        </div>
      )}
    </div>
  );
}

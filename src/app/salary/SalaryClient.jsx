'use client';

import { useState, useRef, useEffect } from 'react';
import {
  DollarSign, MapPin, Briefcase, TrendingUp, Search, BarChart3,
} from 'lucide-react';

const CURRENCY_SYMBOLS = { USD: '$', CAD: 'C$', GBP: '\u00a3' };

function fmt(amount, currency = 'CAD') {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US')}`;
}

function hourly(annual) {
  return (annual / 2080).toFixed(2);
}

function SalaryBar({ label, min, median, max, currency, isPrimary, maxValue }) {
  const barWidth = maxValue ? Math.round((median / maxValue) * 100) : 100;
  const sym = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      isPrimary
        ? 'bg-teal-500/[0.06] border-teal-500/20'
        : 'bg-white/[0.02] border-white/10'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">{label}</span>
          {isPrimary && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Primary
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{currency}</span>
      </div>

      {/* Salary range bar */}
      <div className="relative h-3 rounded-full bg-white/[0.04] mb-4 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Min / Median / Max */}
      <div className="grid grid-cols-3 gap-3 mb-3">
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

      {/* Hourly equivalent */}
      <div className="pt-3 border-t border-white/[0.06]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Hourly (≈2080 hrs/yr)</p>
        <p className="text-xs text-slate-400">
          <span className="text-slate-500">{sym}{hourly(min)}</span>
          <span className="mx-1.5 text-slate-600">–</span>
          <span className="text-emerald-400 font-semibold">{sym}{hourly(median)}</span>
          <span className="mx-1.5 text-slate-600">–</span>
          <span className="text-slate-500">{sym}{hourly(max)}</span>
          <span className="ml-1.5 text-slate-600">/hr</span>
        </p>
      </div>
    </div>
  );
}

function ComparisonChart({ regions }) {
  const maxMedian = Math.max(...regions.map((r) => r.median));

  const barColors = [
    'from-teal-500 to-cyan-500',
    'from-blue-500 to-sky-500',
  ];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-teal-400" />
        <h3 className="text-base font-semibold text-white">Winnipeg vs US Comparison</h3>
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
        Note: CAD and USD values are not directly comparable without exchange-rate conversion.
      </p>
    </div>
  );
}

export default function SalaryClient() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const wrapperRef = useRef(null);

  // Load all roles on mount for autocomplete
  useEffect(() => {
    fetch('/api/salary?role=software+engineer')
      .then((r) => r.json())
      .then((d) => {
        if (d.availableRoles) setAllRoles(d.availableRoles);
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleInputChange(value) {
    setQuery(value);
    if (value.trim().length === 0) {
      setSuggestions(allRoles);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = allRoles.filter(
      (r) =>
        r.role.toLowerCase().includes(lower) ||
        r.noc.includes(lower) ||
        r.category.toLowerCase().includes(lower)
    );
    setSuggestions(filtered);
    setShowSuggestions(true);
  }

  async function doSearch(roleStr) {
    if (!roleStr.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    setShowSuggestions(false);

    try {
      const res = await fetch(`/api/salary?role=${encodeURIComponent(roleStr.trim())}`);
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

  function handleSubmit(e) {
    e.preventDefault();
    doSearch(query);
  }

  function handleSelect(role) {
    setQuery(role.role);
    setShowSuggestions(false);
    doSearch(role.role);
  }

  const maxValue = data
    ? Math.max(...data.allRegions.map((r) => r.max))
    : 0;

  // Group suggestions by category
  const grouped = {};
  suggestions.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-semibold text-white">Salary Lookup</h2>
          <span className="ml-auto text-[10px] text-slate-500">Canada & US salary ranges</span>
        </div>

        <div className="flex gap-3" ref={wrapperRef}>
          <div className="flex-1 relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length === 0) setSuggestions(allRoles);
                setShowSuggestions(true);
              }}
              placeholder="Type a job title or NOC code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-2xl z-50">
                {Object.entries(grouped).map(([cat, roles]) => (
                  <div key={cat}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-white/[0.02] sticky top-0">
                      {cat}
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => handleSelect(r)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <span className="text-sm text-slate-900 dark:text-white flex-1">{r.role}</span>
                        <span className="text-[10px] text-slate-500 font-mono">NOC {r.noc}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300 text-sm font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              {data.matchedRole}
            </span>
            {data.noc && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 text-sm font-medium font-mono">
                NOC {data.noc}
              </span>
            )}
            {data.category && (
              <span className="text-xs text-slate-500">{data.category}</span>
            )}
          </div>

          {/* Primary salary card — Canada */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-500/[0.08] to-cyan-500/[0.04] border border-teal-500/20 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-semibold text-white">
                {data.matchedRole} &mdash; Winnipeg, MB (CAD)
              </h3>
            </div>

            {/* Visual salary range */}
            <div className="mb-6">
              <div className="relative h-4 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-teal-500/30 to-cyan-500/30"
                  style={{ left: '0%', right: '0%' }} />
                <div
                  className="absolute inset-y-0 w-1 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/30"
                  style={{ left: `${((data.primary.median - data.primary.min) / (data.primary.max - data.primary.min)) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
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
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Minimum</p>
                <p className="text-lg font-bold text-slate-300">
                  {fmt(data.primary.min, data.primary.currency)}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{CURRENCY_SYMBOLS[data.primary.currency]}{hourly(data.primary.min)}/hr</p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1">Median</p>
                <p className="text-lg font-bold text-emerald-400">
                  {fmt(data.primary.median, data.primary.currency)}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">{CURRENCY_SYMBOLS[data.primary.currency]}{hourly(data.primary.median)}/hr</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Maximum</p>
                <p className="text-lg font-bold text-slate-300">
                  {fmt(data.primary.max, data.primary.currency)}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{CURRENCY_SYMBOLS[data.primary.currency]}{hourly(data.primary.max)}/hr</p>
              </div>
            </div>
          </div>

          {/* Regional comparison cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
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
            Start typing a job title or Canadian NOC code to compare salary ranges across Canada and the US.
          </p>
        </div>
      )}
    </div>
  );
}

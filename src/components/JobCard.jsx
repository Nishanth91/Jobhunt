'use client';

import { MapPin, Clock, ExternalLink, Bookmark, BookmarkCheck, ArrowRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ScoreRing, SourceBadge, StatusBadge } from './ScoreBadge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Gradient colors based on company name hash
const GRADIENTS = [
  'from-teal-500 to-cyan-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-500',
];

function companyToGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// Generate multiple domain guesses for a company — best-first order
function companyToDomains(name) {
  const raw = name.toLowerCase().trim();
  const stripped = raw
    .replace(/\b(inc|incorporated|ltd|limited|llc|corp|corporation|pvt|co\.|group|solutions|technologies|services|international|company|india|usa|canada|uk|gmbh|sa|ag|plc|holdings|enterprises|associates|partners|consulting|industries|systems)\b\.?/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  const words = stripped.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return [];

  const seen = new Set();
  const push = (d) => { if (d && !seen.has(d)) { seen.add(d); } };

  // Ordered from most to least likely to match Clearbit
  push(`${words.join('')}.com`);                      // fullname.com
  push(`${words[0]}.com`);                             // firstname.com
  if (words.length >= 2) push(`${words[0]}${words[1]}.com`); // firstsecond.com
  if (/canada|canadian/i.test(name)) push(`${words[0]}.ca`);

  return [...seen].slice(0, 3);
}

// Build Clearbit URL list — websiteDomain takes priority, then guesses
function getLogoUrls(company, websiteDomain) {
  if (websiteDomain) {
    return [`https://logo.clearbit.com/${websiteDomain}?size=128`];
  }
  return companyToDomains(company).map((d) => `https://logo.clearbit.com/${d}?size=128`);
}

export default function JobCard({ job, onSave, onUnsave, onDismiss, saved = false, showATS = false }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // job.id only exists for saved jobs (DB records). Search results only have externalId.
  const isSavedJob = !!job.id;

  const companyInitials = job.company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  // If job has a website URL, extract its hostname; otherwise fall through to domain guesses
  const websiteDomain = job.companyWebsite
    ? (() => { try { return new URL(job.companyWebsite).hostname.replace('www.', ''); } catch { return null; } })()
    : null;
  const logoUrls = getLogoUrls(job.company, websiteDomain);
  const [logoIdx, setLogoIdx] = useState(0);
  const gradient = companyToGradient(job.company);

  const handleSaveAndView = async () => {
    if (isSaved && isSavedJob) {
      router.push(`/jobs/${job.id}`);
      return;
    }
    setSaving(true);
    try {
      const savedJob = await onSave?.(job);
      setIsSaved(true);
      // Navigate to detail page if we got an id back
      if (savedJob?.id) router.push(`/jobs/${savedJob.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async (e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      await onUnsave?.(job);
      setIsSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = async (e) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      await onDismiss?.(job);
    } catch {
      setDismissed(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-5 hover:border-teal-500/40 hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5">
      {/* Dismiss button — top-right corner, only on hover */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          title="Dismiss this job"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10"
        >
          <X size={13} />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Company Logo / Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden`}>
          {!logoError && logoUrls.length > 0 ? (
            <img
              src={logoUrls[logoIdx]}
              alt={job.company}
              className="w-full h-full object-contain p-1.5 bg-white rounded-xl"
              onError={() => {
                // Try next logo source, or fall back to initials
                if (logoIdx + 1 < logoUrls.length) {
                  setLogoIdx(logoIdx + 1);
                } else {
                  setLogoError(true);
                }
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            companyInitials || '?'
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            {isSavedJob ? (
              <Link
                href={`/jobs/${job.id}`}
                className="text-base font-semibold text-white hover:text-teal-300 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
            ) : (
              <span className="text-base font-semibold text-white line-clamp-1">{job.title}</span>
            )}

            {/* Save / Unsave toggle */}
            {isSaved ? (
              <button
                onClick={handleUnsave}
                disabled={saving}
                className="flex-shrink-0 text-teal-400 hover:text-red-400 transition-colors"
                title="Remove from saved"
              >
                <BookmarkCheck size={18} />
              </button>
            ) : (
              <button
                onClick={() => { setSaving(true); onSave?.(job).then((s) => { setIsSaved(true); setSaving(false); }).catch(() => setSaving(false)); }}
                disabled={saving}
                className="flex-shrink-0 text-slate-500 hover:text-teal-400 transition-colors"
                title="Save job"
              >
                <Bookmark size={18} />
              </button>
            )}
          </div>

          {/* Company + Location */}
          <p className="text-sm text-teal-300 font-medium mt-0.5">{job.company}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={11} /> {job.location}
            </span>
            {job.postedAt && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} />
                {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
              </span>
            )}
            {job.salary && (
              <span className="text-xs text-emerald-400 font-medium">{job.salary}</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <SourceBadge source={job.source} />
            {job.status && job.status !== 'SAVED' && <StatusBadge status={job.status} />}
          </div>
        </div>
      </div>

      {/* Score Row + Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
        {job.matchScore > 0 && (
          <div className="flex items-center gap-1.5">
            <ScoreRing score={Math.round(job.matchScore)} size={48} />
            <span className="text-[10px] text-slate-500 leading-tight">Match<br/>Score</span>
          </div>
        )}
        {showATS && job.atsScore > 0 && (
          <div className="flex items-center gap-1.5">
            <ScoreRing score={Math.round(job.atsScore)} size={48} />
            <span className="text-[10px] text-slate-500 leading-tight">ATS<br/>Score</span>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 text-xs font-medium hover:text-white border border-white/8 transition-all"
            title="Open original posting"
          >
            <ExternalLink size={11} />
          </a>

          {isSavedJob ? (
            <Link
              href={`/jobs/${job.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/20"
            >
              View Details <ArrowRight size={11} />
            </Link>
          ) : (
            <button
              onClick={handleSaveAndView}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isSaved ? 'View Details' : 'Save & View'} <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

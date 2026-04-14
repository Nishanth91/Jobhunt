'use client';

export function ScoreRing({ score, size = 72, label = '' }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(score, 100));
  const strokeDash = (progress / 100) * circumference;

  const color =
    progress >= 80 ? '#10b981' :
    progress >= 60 ? '#14b8a6' :
    progress >= 40 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    SAVED:       'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    APPLIED:     'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    INTERVIEW:   'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    FINAL_ROUND: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    OFFER:       'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    REJECTED:    'bg-red-500/20 text-red-300 border border-red-500/30',
    SCREENING:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  };

  const labels = {
    SAVED: 'Saved', APPLIED: 'Applied', INTERVIEW: 'Interview',
    FINAL_ROUND: 'Final Round', OFFER: 'Offer', REJECTED: 'Rejected', SCREENING: 'Screening',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.SAVED}`}>
      {labels[status] || status}
    </span>
  );
}

export function SourceBadge({ source }) {
  const styles = {
    adzuna: 'bg-orange-500/20 text-orange-300',
    jobicy: 'bg-teal-500/20 text-teal-300',
    manual: 'bg-slate-600/40 text-slate-300',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[source] || styles.manual}`}>
      {source}
    </span>
  );
}

export function ScoreBar({ value, label, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-medium text-white">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color] || colors.teal} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

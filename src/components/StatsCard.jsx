export default function StatsCard({ icon: Icon, label, value, sub, color = 'indigo', trend }) {
  const colors = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
      value: 'text-indigo-300',
      glow: 'bg-indigo-500',
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-600/5',
      border: 'border-violet-500/20',
      icon: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white',
      value: 'text-violet-300',
      glow: 'bg-violet-500',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
      value: 'text-emerald-300',
      glow: 'bg-emerald-500',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      icon: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
      value: 'text-amber-300',
      glow: 'bg-amber-500',
    },
    blue: {
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      value: 'text-blue-300',
      glow: 'bg-blue-500',
    },
  };

  const c = colors[color] || colors.indigo;

  return (
    <div className={`stat-shine relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-5 hover:scale-[1.02] transition-all duration-300 hover:shadow-glow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${c.value} tracking-tight`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1.5 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${c.icon}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {/* Decorative glow blob */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl ${c.glow}`} />
    </div>
  );
}

'use client';

export default function SkillTags({ skills = [], highlight = [], max = 12 }) {
  const displayed = skills.slice(0, max);
  const remaining = skills.length - max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayed.map((skill) => {
        const isHighlighted = highlight.some(
          (h) => h.toLowerCase() === skill.toLowerCase()
        );
        return (
          <span
            key={skill}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              isHighlighted
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:border-indigo-500/30 hover:text-indigo-200'
            }`}
          >
            {skill}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-slate-500 border border-white/10">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

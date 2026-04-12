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
                ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:border-teal-500/30 hover:text-teal-200'
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

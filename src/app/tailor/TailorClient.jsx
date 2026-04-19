'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardPaste, Download, Loader2, Sparkles, CheckCircle2,
  AlertCircle, FileText, Target, ArrowRight,
} from 'lucide-react';
import { ScoreRing } from '@/components/ScoreBadge';
import SkillTags from '@/components/SkillTags';

export default function TailorClient({ activeResume }) {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [additional, setAdditional] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!activeResume) {
    return (
      <div className="max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-amber-400" size={22} />
          <h2 className="text-lg font-semibold text-white">No active resume</h2>
        </div>
        <p className="text-sm text-slate-300">
          Upload a resume and mark it <span className="text-emerald-400">active</span> on the Resumes page before tailoring.
        </p>
        <Link href="/resumes" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all">
          Go to Resumes <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const handleGenerate = async () => {
    setError('');
    setResult(null);
    if (jobDescription.trim().length < 40) {
      setError('Paste the full job description — at least a few sentences.');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/resume/tailor-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          additionalText: additional,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tailoring failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/resume/tailor-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          additionalText: additional,
          download: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeCo = (company || 'JobDescription').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Tailored_${safeCo}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJobDescription(text);
    } catch {
      setError('Clipboard access denied — paste manually.');
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-teal-400" /> Tailor Resume to a Job Description
        </h2>
        <p className="text-sm text-slate-400">
          Paste any job description — we'll rewrite your active resume to match and give you a downloadable Word file with an ATS score.
        </p>
      </div>

      {/* Active resume banner */}
      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">Active: {activeResume.fileName}</p>
          <p className="text-xs text-slate-400">
            {activeResume.yearsExp ? `${activeResume.yearsExp} yrs exp` : 'Experience detected'} · {activeResume.skills?.length || 0} skills on file
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — input */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Job Title (optional)</span>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Production Supervisor"
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.04] text-sm text-white border border-white/10 focus:border-teal-500/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company (optional)</span>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Industries"
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.04] text-sm text-white border border-white/10 focus:border-teal-500/40 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Job Description *</span>
              <button
                onClick={handlePaste}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-400 text-xs hover:text-white border border-white/10 transition-all"
              >
                <ClipboardPaste size={11} /> Paste from clipboard
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={14}
              placeholder="Paste the full job description here — responsibilities, requirements, qualifications. The more context, the better the tailoring."
              className="w-full px-3 py-3 rounded-xl bg-white/[0.04] text-sm text-white border border-white/10 focus:border-teal-500/40 focus:outline-none resize-y font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">{jobDescription.length.toLocaleString()} characters</p>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Additional Context (optional)</span>
            <textarea
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              rows={3}
              placeholder="Anything extra you want included — recent certifications, a relevant project, current role updates…"
              className="mt-1.5 w-full px-3 py-2 rounded-xl bg-white/[0.04] text-sm text-white border border-white/10 focus:border-teal-500/40 focus:outline-none resize-y"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-sm font-semibold hover:shadow-glow disabled:opacity-50 transition-all"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Tailoring…</>
              ) : (
                <><Sparkles size={16} /> Generate Tailored Resume</>
              )}
            </button>
          </div>
        </div>

        {/* Right — result */}
        <div className="space-y-4">
          {!result && !generating && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto">
                <Target size={22} className="text-teal-400" />
              </div>
              <p className="text-sm font-semibold text-white">Your tailored resume will appear here</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Paste a job description on the left and hit Generate. You'll get an ATS score, matched skills, and a downloadable Word doc.
              </p>
            </div>
          )}

          {generating && (
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-8 text-center space-y-3">
              <Loader2 size={28} className="text-teal-400 animate-spin mx-auto" />
              <p className="text-sm text-white">Analysing the job description and rewriting your resume…</p>
              <p className="text-xs text-slate-400">Extracting keywords, matching skills, strengthening bullets.</p>
            </div>
          )}

          {result && (
            <>
              {/* ATS score */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5">
                <div className="flex items-center gap-4">
                  <ScoreRing score={Math.round(result.atsScore || 0)} size={72} />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">ATS Match Score</p>
                    <p className="text-lg font-semibold text-white">
                      {result.atsScore >= 80 ? 'Strong match' : result.atsScore >= 65 ? 'Good match' : 'Needs more alignment'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Scored against the tailored resume, not the original.
                    </p>
                  </div>
                </div>
                {result.atsBreakdown?.breakdown && (
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                    {Object.entries(result.atsBreakdown.breakdown).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase">{k}</p>
                        <p className="text-sm font-semibold text-white">{v}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched skills */}
              {result.content?.matchingSkills?.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                      Skills that match ({result.content.matchingSkills.length})
                    </p>
                  </div>
                  <SkillTags skills={result.content.matchingSkills} max={20} />
                </div>
              )}

              {/* Added skills */}
              {result.content?.addedSkills?.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-indigo-400" />
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                      Added from the JD ({result.content.addedSkills.length})
                    </p>
                  </div>
                  <SkillTags skills={result.content.addedSkills} max={10} />
                  <p className="text-[11px] text-slate-400 mt-2">
                    These keywords were woven into your skills section and, where natural, into your experience bullets.
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {result.atsBreakdown?.suggestions?.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Suggestions</p>
                  {result.atsBreakdown.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-slate-300 flex gap-1.5">
                      <span className="text-amber-400">•</span> {s}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] text-white text-sm font-semibold hover:bg-white/[0.08] border border-white/10 transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <><Loader2 size={16} className="animate-spin" /> Preparing download…</>
                ) : (
                  <><Download size={16} /> Download Tailored Resume (.docx)</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  MapPin, Clock, ExternalLink, Globe, Mail, FileText, PenLine,
  Loader2, Download, ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, Briefcase, Wand2, X, Printer, ArrowLeft, Sparkles,
  ClipboardList
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScoreRing, ScoreBar, StatusBadge, SourceBadge } from '@/components/ScoreBadge';
import SkillTags from '@/components/SkillTags';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'FINAL_ROUND', 'OFFER', 'REJECTED'];

// ─── Resume Preview Panel ────────────────────────────────────
function ResumePreviewPanel({ content, documentId, onClose, onDownload, jobTitle }) {
  if (!content) return null;

  const handlePrint = () => {
    const summaryHtml = content.summaryBullets?.length > 1
      ? content.summaryBullets.map((b) => `<li>${b}</li>`).join('')
      : `<p class="body">${content.summary || ''}</p>`;
    const summaryWrapper = content.summaryBullets?.length > 1
      ? `<ul class="summary-list">${summaryHtml}</ul>`
      : summaryHtml;

    // Build filename: User_Company_resume — also used as <title> for Save-as-PDF default
    const safeName = (content.name || 'Resume').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const safeCompany = (content.tailoredFor?.company || 'Company').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const pdfTitle = `${safeName}_${safeCompany}_resume`;

    const htmlContent = `<!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>${pdfTitle}</title>
      <style>
        /* margin:0 suppresses browser header/footer chrome (date, URL, page#).
           Content spacing is handled via body padding instead.
           For proper page-break spacing, use Chrome > More Settings > uncheck "Headers and footers". */
        @page { margin: 0; size: letter; }
        @page :first { margin: 0; }
        @page :left { margin: 0; }
        @page :right { margin: 0; }
        * { margin: 0; padding: 0; }
        body {
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 52px 56px;
          color: #111;
          line-height: 1.55;
          font-size: 13px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          html, body { margin: 0 !important; }
          body { padding: 52px 56px !important; }
          .no-print { display: none !important; }
        }
        h1 { font-size: 24px; color: #1e1b4b; margin: 0 0 4px; font-weight: 700; }
        .role-line { color: #4b5563; font-size: 13px; margin-bottom: 16px; }
        .divider { border: none; border-top: 2.5px solid #4338ca; margin: 0 0 18px; }
        h2 {
          font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1e1b4b;
          border-bottom: 1px solid #c7d2fe; padding-bottom: 3px; margin: 28px 0 10px;
          font-weight: 700; page-break-after: avoid;
        }
        .body { margin: 3px 0; font-size: 13px; }
        .summary-list { margin: 0; padding-left: 18px; }
        .summary-list li { margin-bottom: 4px; font-size: 13px; }
        .skills { font-size: 13px; }
        .exp-block { page-break-inside: avoid; }
        .exp-title { font-weight: 700; color: #1e1b4b; margin: 14px 0 2px; font-size: 13px; page-break-after: avoid; }
        .exp-sub { font-style: italic; color: #4b5563; font-size: 12px; margin: 2px 0; page-break-after: avoid; }
        .bullet { margin-left: 18px; margin-bottom: 2px; font-size: 13px; }
        .spacer { height: 10px; }
        .print-tip {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          background: #fffbeb; border-bottom: 2px solid #f59e0b; padding: 10px 20px;
          font-size: 13px; color: #92400e; text-align: center;
        }
      </style></head><body>
      <div class="no-print print-tip">
        <strong>Tip:</strong> In the print dialog, click <b>More settings</b> and <b>uncheck "Headers and footers"</b> to remove the date/URL watermark, then set Margins to <b>None</b>.
      </div>
      <h1>${content.name}</h1>
      <p class="role-line">${content.tailoredFor.title} | ${content.tailoredFor.company}</p>
      ${[content.contactEmail, content.phone, content.linkedIn].filter(Boolean).length > 0
        ? `<p class="role-line" style="font-size:11px;color:#6b7280">${[content.contactEmail, content.phone, content.linkedIn].filter(Boolean).join('  |  ')}</p>`
        : ''}
      <hr class="divider"/>

      ${content.summary ? `<h2>Professional Summary</h2>${summaryWrapper}` : ''}

      <h2>Technical Skills</h2>
      <p class="skills">${content.skills.join(', ')}</p>

      ${content.experience?.length ? `<h2>Professional Experience</h2>
        ${content.experience.map((l) => {
          const t = l.trim();
          if (!t) return '<div class="spacer"></div>';
          if (/^[•\-\*]\s/.test(t)) return `<p class="bullet">&bull; ${t.replace(/^[•\-\*]\s*/, '')}</p>`;
          return `<p class="exp-title">${t}</p>`;
        }).join('')}` : ''}

      ${content.education?.length ? `<h2>Education</h2>
        ${content.education.map((l) => `<p class="body">${l}</p>`).join('')}` : ''}

      ${content.certs?.length ? `<h2>Certifications</h2>
        ${content.certs.map((l) => `<p class="body">${l}</p>`).join('')}` : ''}

      ${content.additional ? `<h2>Additional Experience</h2><p class="body">${content.additional.replace(/\n/g, '<br/>')}</p>` : ''}
      </body></html>`;

    // Use Blob URL instead of about:blank to avoid "about:blank" showing in Chrome print header
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const w = window.open(blobUrl, '_blank');
    w.addEventListener('load', () => { w.focus(); setTimeout(() => w.print(), 300); });
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="modal-panel border border-white/10 rounded-2xl md:rounded-3xl w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header — always dark */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10 gap-2">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold truncate" style={{ color: '#fff' }}>Customized Resume Preview</h3>
            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>For: {content.tailoredFor.title} at {content.tailoredFor.company}</p>
          </div>
          <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
            >
              <Printer size={13} /> <span className="hidden sm:inline">Save as PDF</span><span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-medium hover:bg-blue-500/30 border border-blue-500/20 transition-all"
            >
              <Download size={13} /> <span className="hidden sm:inline">Download Word</span><span className="sm:hidden">Word</span>
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white border border-white/10">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Resume content — always WHITE background like a real document */}
        <div className="resume-preview-panel overflow-y-auto flex-1 px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5 text-sm rounded-b-2xl md:rounded-b-3xl" style={{ background: '#fff', color: '#111827' }}>
          {/* Name */}
          <div style={{ borderBottom: '2.5px solid #4338ca', paddingBottom: '12px' }}>
            <h2 className="text-2xl font-bold" style={{ color: '#1e1b4b' }}>{content.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
              {content.tailoredFor.title} | {content.tailoredFor.company}
            </p>
            {(content.contactEmail || content.phone || content.linkedIn) && (
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                {[content.contactEmail, content.phone, content.linkedIn].filter(Boolean).join('  |  ')}
              </p>
            )}
          </div>

          {/* Summary */}
          {content.summary && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Professional Summary</p>
              {content.summaryBullets?.length > 1 ? (
                <ul className="space-y-1 ml-3">
                  {content.summaryBullets.map((b, i) => (
                    <li key={i} className="leading-relaxed text-xs flex gap-1.5" style={{ color: '#374151' }}>
                      <span style={{ color: '#4338ca' }} className="mt-0.5">•</span> {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="leading-relaxed text-sm" style={{ color: '#374151' }}>{content.summary}</p>
              )}
            </div>
          )}

          {/* Skills */}
          {content.skills?.length > 0 && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Technical Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {content.skills.map((s) => {
                  const isNew = content.addedSkills?.includes(s);
                  const isMatch = content.matchingSkills?.includes(s);
                  return (
                    <span key={s} className={`px-2 py-0.5 rounded-md text-xs border ${
                      isNew ? 'skill-badge-new' :
                      isMatch ? 'skill-badge-match' :
                      'skill-badge-default'
                    }`} style={{
                      background: isNew ? 'rgba(99,102,241,0.12)' : isMatch ? 'rgba(16,185,129,0.1)' : '#f3f4f6',
                      color: isNew ? '#4338ca' : isMatch ? '#047857' : '#374151',
                      borderColor: isNew ? 'rgba(99,102,241,0.25)' : isMatch ? 'rgba(16,185,129,0.2)' : '#e5e7eb',
                    }}>
                      {s}{isNew ? ' ✦' : ''}
                    </span>
                  );
                })}
              </div>
              {content.addedSkills?.length > 0 && (
                <p className="text-xs mt-1.5" style={{ color: '#4338ca' }}>✦ Added to target this role &nbsp;|&nbsp; <span style={{ color: '#047857' }}>Green = matches job requirements</span></p>
              )}
            </div>
          )}

          {/* Experience */}
          {(content.experienceBlocks?.length > 0 || content.experience?.length > 0) && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Professional Experience</p>
              {content.experienceBlocks?.length > 0 ? (
                <div className="space-y-3">
                  {content.experienceBlocks.map((block, bi) => (
                    <div key={bi} className="space-y-0.5">
                      {block.title && (
                        <p className="text-xs font-semibold" style={{ color: '#1e1b4b' }}>{block.title}</p>
                      )}
                      {block.meta && (
                        <p className="text-[11px] italic" style={{ color: '#6b7280' }}>{block.meta}</p>
                      )}
                      {block.bullets?.map((b, i) => (
                        <p key={i} className="text-xs leading-relaxed ml-4" style={{ color: '#374151' }}>
                          • {b.replace(/^[•\-\*]\s*/, '')}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {content.experience.map((line, i) => {
                    const t = line.trim();
                    if (!t) return <div key={i} className="h-2" />;
                    const isBullet = /^[•\-\*]\s/.test(t);
                    return (
                      <p key={i} className={`text-xs leading-relaxed ${isBullet ? 'ml-4' : 'font-semibold'}`} style={{ color: isBullet ? '#374151' : '#1e1b4b' }}>
                        {t}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {content.education?.length > 0 && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Education</p>
              {content.education.map((line, i) => (
                <p key={i} className="text-xs" style={{ color: '#374151' }}>{typeof line === 'string' ? line : line.degree || ''}</p>
              ))}
            </div>
          )}

          {/* Certs */}
          {content.certs?.length > 0 && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Certifications</p>
              {content.certs.map((line, i) => (
                <p key={i} className="text-xs" style={{ color: '#374151' }}>{line}</p>
              ))}
            </div>
          )}

          {/* Additional */}
          {content.additional && (
            <div>
              <p className="section-head text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#1e1b4b', borderBottom: '1px solid #c7d2fe', paddingBottom: '3px' }}>Additional Experience</p>
              <p className="text-xs whitespace-pre-wrap" style={{ color: '#374151' }}>{content.additional}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ATS Fix Log Panel ────────────────────────────────────────
function ATSFixLog({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/15 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList size={14} className="text-teal-400" />
        <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">ATS Fix Log</h4>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              entry.type === 'added' ? 'bg-emerald-500/20 text-emerald-400' :
              entry.type === 'improved' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              <span className="text-[10px] font-bold">{entry.type === 'added' ? '+' : entry.type === 'improved' ? '↑' : '!'}</span>
            </div>
            <div>
              <p className="text-xs text-slate-300">{entry.message}</p>
              {entry.keywords && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.keywords.map((k) => (
                    <span key={k} className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/15 text-teal-300 border border-teal-500/20">{k}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function JobDetailClient({ job, resumeData, documents, userName }) {
  const router = useRouter();
  const [status, setStatus] = useState(job.status || 'SAVED');
  const [atsResult, setAtsResult] = useState(null);
  const [scoringATS, setScoringATS] = useState(false);
  const [fixingATS, setFixingATS] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [atsFixLog, setAtsFixLog] = useState([]);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [emailDraft, setEmailDraft] = useState(null);
  const [showDesc, setShowDesc] = useState(false);
  const [tab, setTab] = useState('overview');
  const [additionalText, setAdditionalText] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [loadingPrep, setLoadingPrep] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  const scoreATS = async () => {
    if (!resumeData) return;
    setScoringATS(true);
    try {
      const res = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id }),
      });
      const data = await res.json();
      setAtsResult(data);
      setTab('ats');
      return data;
    } finally {
      setScoringATS(false);
    }
  };

  /** Single-click: score → fix → re-score, all in one shot */
  const optimizeForATS = async () => {
    if (!resumeData) return;
    setFixingATS(true);
    try {
      // Step 1: score
      setScoringATS(true);
      const scoreRes = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id }),
      });
      const scored = await scoreRes.json();
      setAtsResult(scored);
      setTab('ats');
      setScoringATS(false);

      if (!scored.missingKeywords?.length) {
        // Already fully optimized
        setAtsFixLog([{ type: 'info', message: 'Resume is already fully optimized for this job!' }]);
        return;
      }

      // Step 2: fix
      const fixRes = await fetch('/api/resume/fix-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id }),
      });
      const fixed = await fixRes.json();
      setFixResult(fixed);

      const logEntries = [];
      if (fixed.addedKeywords?.length > 0) {
        logEntries.push({ type: 'added', message: `Injected ${fixed.addedKeywords.length} missing keywords`, keywords: fixed.addedKeywords });
      }
      if (fixed.before !== undefined && fixed.after !== undefined) {
        logEntries.push({ type: 'improved', message: `ATS score: ${fixed.before}% → ${fixed.after}% (+${fixed.after - fixed.before}%)` });
      }
      logEntries.push({ type: 'info', message: 'Resume updated in-place — no extra copies created.' });
      setAtsFixLog((prev) => [...logEntries, ...prev]);

      // Step 3: re-score to reflect the improved resume
      const reScoreRes = await fetch('/api/ats/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id }),
      });
      const reScored = await reScoreRes.json();
      setAtsResult(reScored);
      router.refresh();
    } finally {
      setFixingATS(false);
      setScoringATS(false);
    }
  };

  const generateResume = async () => {
    if (!resumeData) return;
    setGeneratingResume(true);
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id, additionalText, linkedInUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setResumePreview(data.content);
        setCurrentDocId(data.documentId);
        if (data.atsBreakdown) setAtsResult(data.atsBreakdown);
      }
    } finally {
      setGeneratingResume(false);
    }
  };

  const downloadWord = async () => {
    if (!currentDocId) return;
    const res = await fetch(`/api/resume/generate/${currentDocId}/download`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(userName || 'Resume').replace(/\s+/g, '_')}_${(job.company || 'Company').replace(/\s+/g, '_')}_resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeData) return;
    setGeneratingCover(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData.id }),
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter);
      setEmailDraft(data.email);
      setTab('documents');
    } finally {
      setGeneratingCover(false);
    }
  };

  const generateInterviewPrep = async () => {
    setLoadingPrep(true);
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeId: resumeData?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setInterviewPrep(data);
        setTab('interview');
      }
    } finally {
      setLoadingPrep(false);
    }
  };

  const display = atsResult || { total: Math.round(job.atsScore), breakdown: null, matchedSkills: [], missingSkills: [], missingKeywords: [], suggestions: [] };

  return (
    <>
      {resumePreview && (
        <ResumePreviewPanel
          content={resumePreview}
          documentId={currentDocId}
          onClose={() => setResumePreview(null)}
          onDownload={downloadWord}
          jobTitle={job.title}
        />
      )}

      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm md:text-lg flex-shrink-0">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-white">{job.title}</h1>
                <p className="text-teal-300 font-medium mt-0.5 text-sm md:text-base">{job.company}</p>
                <div className="flex items-center gap-2 md:gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs md:text-sm text-slate-400"><MapPin size={13} />{job.location}</span>
                  {job.postedAt && <span className="flex items-center gap-1 text-xs md:text-sm text-slate-500"><Clock size={13} />{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span>}
                  {job.salary && <span className="text-xs md:text-sm text-emerald-400 font-medium">{job.salary}</span>}
                  <SourceBadge source={job.source} />
                </div>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <ScoreRing score={Math.round(job.matchScore)} size={56} label="Match" />
                {display.total > 0 && <ScoreRing score={display.total} size={56} label="ATS" />}
              </div>
              <StatusBadge status={status} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-5 pt-4 md:pt-5 border-t border-white/5">
            <a href={job.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all">
              <ExternalLink size={14} /> View Original
            </a>
            {job.companyWebsite && (
              <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-medium hover:bg-white/[0.08] border border-white/10 transition-all">
                <Globe size={14} /> Company Site
              </a>
            )}
            {job.hrEmail && (
              <a href={`mailto:${job.hrEmail}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-medium hover:bg-white/[0.08] border border-white/10 transition-all">
                <Mail size={14} /> Email HR
              </a>
            )}

            {resumeData ? (
              <>
                <button onClick={optimizeForATS} disabled={fixingATS || scoringATS}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 border border-cyan-500/20 transition-all disabled:opacity-50">
                  {(fixingATS || scoringATS) ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  {fixingATS ? 'Optimizing…' : 'Optimize for ATS'}
                </button>
                <button onClick={() => setShowAdditional(!showAdditional)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 border border-blue-500/20 transition-all">
                  <Sparkles size={14} /> Customized Resume
                </button>
                <button onClick={generateCoverLetter} disabled={generatingCover}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/20 transition-all disabled:opacity-50">
                  {generatingCover ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
                  Cover Letter
                </button>
              </>
            ) : (
              <Link href="/resumes" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/20">
                <Briefcase size={14} /> Upload Resume First
              </Link>
            )}
          </div>

          {/* Additional text panel */}
          {showAdditional && (
            <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-blue-500/20 space-y-3">
              <p className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                <Sparkles size={12} /> Add any recent achievements or context not captured in your resume (optional — blended into experience)
              </p>
              <textarea
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                rows={3}
                placeholder="e.g. Currently leading a team of 5 engineers at XYZ Corp, shipping a new React dashboard..."
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:border-blue-500/50 transition-all resize-none"
              />
              <p className="text-[10px] text-slate-500">LinkedIn, phone & email are pulled from your <a href="/settings" className="text-blue-400 hover:text-blue-300 underline">Account Settings → Contact Info</a>.</p>
              <button onClick={() => { setShowAdditional(false); generateResume(); }} disabled={generatingResume}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 border border-blue-500/20 transition-all disabled:opacity-50">
                {generatingResume ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><FileText size={13} /> Generate & Preview</>}
              </button>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-slate-500">Status:</span>
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  status === s ? 'bg-teal-500/30 text-teal-200 border border-teal-500/30' : 'text-slate-600 hover:text-slate-400 border border-transparent hover:border-white/10'
                }`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 overflow-x-auto no-scrollbar">
          {['overview', 'ats', 'documents', 'interview'].map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === 'interview' && !interviewPrep && !loadingPrep) generateInterviewPrep(); }}
              className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                tab === t ? 'text-teal-300 border-teal-500' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}>
              {t === 'overview' ? 'Job Details' : t === 'ats' ? 'ATS Analysis' : t === 'documents' ? 'Documents' : 'Interview Prep'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <button onClick={() => setShowDesc(!showDesc)} className="flex items-center justify-between w-full text-left">
                  <h3 className="text-sm font-semibold text-white">Job Description</h3>
                  {showDesc ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </button>
                <div className={`mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap ${showDesc ? '' : 'line-clamp-8'}`}>
                  {job.description || 'No description available.'}
                </div>
                {!showDesc && <button onClick={() => setShowDesc(true)} className="mt-2 text-xs text-teal-400 hover:text-teal-300">Show full description</button>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-2.5 text-sm">
                <h3 className="text-sm font-semibold text-white mb-3">Job Details</h3>
                <div className="flex justify-between"><span className="text-slate-500">Company</span><span className="text-white font-medium">{job.company}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-slate-300">{job.location}</span></div>
                {job.salary && <div className="flex justify-between"><span className="text-slate-500">Salary</span><span className="text-emerald-400 font-medium">{job.salary}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Source</span><SourceBadge source={job.source} /></div>
                {job.postedAt && <div className="flex justify-between"><span className="text-slate-500">Posted</span><span className="text-slate-400">{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</span></div>}
              </div>
              {job.hrEmail && (
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">HR Contact Found</p>
                  <a href={`mailto:${job.hrEmail}`} className="text-sm text-emerald-300 break-all hover:text-emerald-200">{job.hrEmail}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATS Tab */}
        {tab === 'ats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">ATS Score Breakdown</h3>
                {!atsResult && (
                  <button onClick={scoreATS} disabled={scoringATS || !resumeData} className="text-xs text-teal-400 hover:text-teal-300 disabled:opacity-50">
                    {scoringATS ? 'Scoring...' : 'Run Analysis'}
                  </button>
                )}
              </div>

              {!resumeData && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <AlertCircle size={14} /> Upload a resume first
                </div>
              )}

              {!atsResult && resumeData && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-xs text-slate-400 text-center">Run a one-click analysis + optimization to maximize your ATS score for this job.</p>
                  <button onClick={optimizeForATS} disabled={fixingATS || scoringATS}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-200 text-sm font-medium hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/20 transition-all disabled:opacity-50">
                    {(fixingATS || scoringATS) ? <><Loader2 size={14} className="animate-spin" /> Optimizing…</> : <><Wand2 size={14} /> Optimize Resume for ATS</>}
                  </button>
                </div>
              )}

              {display.breakdown && (
                <div className="space-y-3">
                  <ScoreBar value={display.breakdown.skills} label="Skills Match" color="teal" />
                  <ScoreBar value={display.breakdown.keywords} label="Keywords Match" color="blue" />
                  <ScoreBar value={display.breakdown.format} label="Resume Format" color="emerald" />
                  <ScoreBar value={display.breakdown.experience} label="Experience Fit" color="amber" />
                </div>
              )}

              {display.total > 0 && (
                <div className="flex items-center justify-center pt-2 border-t border-white/5">
                  <ScoreRing score={display.total} size={80} label="Total ATS Score" />
                </div>
              )}

              {fixResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  ✓ Optimized: {fixResult.before}% → {fixResult.after}%
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* ATS Fix Log — always visible when there are entries */}
              <ATSFixLog entries={atsFixLog} />

              {atsResult?.matchedSkills?.length > 0 && (
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-5">
                  <p className="text-xs font-semibold text-emerald-400 mb-3">✓ Matching Skills ({atsResult.matchedSkills.length})</p>
                  <SkillTags skills={atsResult.matchedSkills} />
                </div>
              )}
              {atsResult?.missingSkills?.length > 0 && (
                <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-5">
                  <p className="text-xs font-semibold text-red-400 mb-3">Missing Skills</p>
                  <SkillTags skills={atsResult.missingSkills} />
                </div>
              )}
              {atsResult?.suggestions?.length > 0 && (
                <div className="rounded-2xl bg-amber-500/5 border border-amber-500/15 p-5">
                  <p className="text-xs font-semibold text-amber-400 mb-3">Suggestions</p>
                  <ul className="space-y-1.5">
                    {atsResult.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {tab === 'documents' && (
          <div className="space-y-4">
            {coverLetter && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-white">Cover Letter</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigator.clipboard.writeText(coverLetter)}
                      className="text-xs text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        const clHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cover Letter</title><style>@page{margin:0;size:letter}@page:first{margin:0}*{margin:0;padding:0}body{font-family:Calibri,Arial,sans-serif;padding:64px 72px;font-size:12pt;line-height:1.6;color:#111}pre{white-space:pre-wrap;font-family:inherit}@media print{html,body{margin:0!important}.no-print{display:none!important}}.no-print{position:fixed;top:0;left:0;right:0;z-index:999;background:#fffbeb;border-bottom:2px solid #f59e0b;padding:10px 20px;font-size:13px;color:#92400e;text-align:center}</style></head><body><div class="no-print"><strong>Tip:</strong> Uncheck <b>"Headers and footers"</b> in More settings, set Margins to <b>None</b>.</div><pre>${coverLetter.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`;
                        const clBlob = new Blob([clHtml], { type: 'text/html;charset=utf-8' });
                        const clUrl = URL.createObjectURL(clBlob);
                        const w = window.open(clUrl, '_blank');
                        w.addEventListener('load', () => { setTimeout(() => w.print(), 300); });
                      }}
                      className="flex items-center gap-1.5 text-xs text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                    >
                      <Printer size={11} /> Save as PDF
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/cover-letter/download', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ text: coverLetter, jobTitle: job.title, company: job.company }),
                        });
                        if (res.ok) {
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `CoverLetter_${job.company}_${job.title}.docx`.replace(/\s+/g, '_');
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                    >
                      <Download size={11} /> Download Word
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-white/[0.02] rounded-xl p-4 border border-white/5 max-h-96 overflow-y-auto">{coverLetter}</pre>
              </div>
            )}
            {emailDraft && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Email Draft</h3>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Subject</p>
                    <p className="text-sm text-white font-medium">{emailDraft.subject}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Body</p>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{emailDraft.body}</pre>
                  </div>
                </div>
              </div>
            )}
            {!coverLetter && documents.length === 0 && (
              <div className="text-center py-16">
                <FileText size={40} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No documents yet</p>
                <p className="text-sm text-slate-500 mt-1">Generate a customized resume or cover letter using the buttons above</p>
              </div>
            )}
          </div>
        )}

        {/* Interview Prep Tab */}
        {tab === 'interview' && (
          <div className="space-y-6">
            {loadingPrep && (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader2 size={28} className="animate-spin text-teal-400" />
                <p className="text-sm text-slate-400">Generating interview prep for {job.title}...</p>
              </div>
            )}

            {interviewPrep && (
              <>
                {/* Behavioral Questions */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Briefcase size={14} className="text-teal-400" /> Likely Behavioral Questions
                  </h3>
                  <div className="space-y-3">
                    {interviewPrep.behavioral.map((q, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        <p className="text-sm text-white font-medium">Q: {q.question}</p>
                        <p className="text-xs text-teal-300 flex items-center gap-1.5">
                          <Sparkles size={10} /> {q.tip}
                        </p>
                        {q.context && (
                          <p className="text-[10px] text-slate-600 italic">Based on: "{q.context.slice(0, 100)}..."</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Questions */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Wand2 size={14} className="text-cyan-400" /> Technical & Role-Specific
                  </h3>
                  <div className="space-y-3">
                    {interviewPrep.technical.map((q, i) => (
                      <div key={i} className={`p-4 rounded-xl border space-y-2 ${
                        q.type === 'strength' ? 'bg-emerald-500/[0.04] border-emerald-500/15' :
                        q.type === 'gap' ? 'bg-amber-500/[0.04] border-amber-500/15' :
                        'bg-white/[0.03] border-white/5'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-white font-medium">Q: {q.question}</p>
                          {q.type === 'strength' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">Your Strength</span>}
                          {q.type === 'gap' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">Prepare</span>}
                        </div>
                        <p className="text-xs text-slate-400">{q.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STAR Talking Points */}
                {interviewPrep.starPoints.length > 0 && (
                  <div className="rounded-2xl bg-gradient-to-br from-teal-500/[0.06] to-cyan-500/[0.04] border border-teal-500/20 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-400" /> STAR Talking Points (from your resume)
                    </h3>
                    <div className="space-y-3">
                      {interviewPrep.starPoints.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                          <p className="text-xs text-slate-500">{s.situation}</p>
                          <p className="text-sm text-white">Your experience: {s.action}</p>
                          <p className="text-xs text-teal-300">{s.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Questions to Ask */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <PenLine size={14} className="text-blue-400" /> Questions to Ask the Interviewer
                    </h3>
                    <ul className="space-y-2">
                      {interviewPrep.askInterviewer.map((q, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Research Tips */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Globe size={14} className="text-amber-400" /> Company Research Tips
                    </h3>
                    <ul className="space-y-2">
                      {interviewPrep.researchTips.map((t, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {interviewPrep.matchedSkills.length > 0 && (
                    <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 p-4">
                      <p className="text-xs font-semibold text-emerald-400 mb-2">Skills You Can Highlight ({interviewPrep.matchedSkills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interviewPrep.matchedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {interviewPrep.missingSkills.length > 0 && (
                    <div className="rounded-xl bg-amber-500/[0.05] border border-amber-500/15 p-4">
                      <p className="text-xs font-semibold text-amber-400 mb-2">Skills to Prepare For ({interviewPrep.missingSkills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interviewPrep.missingSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-300 border border-amber-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

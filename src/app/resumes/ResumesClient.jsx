'use client';

import { useState } from 'react';
import {
  FileText, ExternalLink, Building, Clock, Trash2, AlertTriangle,
  Loader2, CheckCircle, ToggleLeft, ToggleRight, Upload
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScoreRing } from '@/components/ScoreBadge';
import SkillTags from '@/components/SkillTags';
import ResumeUploader from '@/components/ResumeUploader';

export default function ResumesClient({ resumes, documents }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [activeTab, setActiveTab] = useState('uploaded');

  // ─── Uploaded resume handlers ────────────────────────────────
  const handleDeleteResume = async (id) => {
    if (!confirm('Remove this resume?')) return;
    await fetch(`/api/resume/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleToggleActive = async (id, currentlyActive) => {
    setToggling(id);
    try {
      await fetch(`/api/resume/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });
      router.refresh();
    } finally {
      setToggling(null);
    }
  };

  // ─── Tailored document handlers ──────────────────────────────
  const handleDeleteDoc = async (id) => {
    await fetch(`/api/tailored-doc/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/resume/all', { method: 'DELETE' });
      if (res.ok) {
        setShowConfirm(false);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  const totalItems = resumes.length + documents.length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Resumes</h2>
          <p className="text-sm text-slate-400">
            Manage your uploaded resumes and job-specific tailored versions.
          </p>
        </div>
        {totalItems > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 border border-red-500/20 transition-all flex-shrink-0"
          >
            <Trash2 size={14} /> Remove All
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        <button
          onClick={() => setActiveTab('uploaded')}
          className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'uploaded'
              ? 'text-teal-300 border-teal-500'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Uploaded ({resumes.length})
        </button>
        <button
          onClick={() => setActiveTab('tailored')}
          className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'tailored'
              ? 'text-teal-300 border-teal-500'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Tailored ({documents.length})
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}
        >
          <div className="modal-panel border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete all resumes?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This will permanently remove all {resumes.length} uploaded resume{resumes.length !== 1 ? 's' : ''} and {documents.length} tailored resume{documents.length !== 1 ? 's' : ''}. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-slate-300 text-sm font-medium hover:bg-white/[0.08] border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 border border-red-500/30 transition-all disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete All</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Uploaded Resumes Tab ──────────────────────────────── */}
      {activeTab === 'uploaded' && (
        <div className="space-y-6">
          {/* Upload section */}
          <div>
            <p className="text-sm text-slate-400 mb-4">
              Upload your resume and we'll extract your skills, experience, and education for job matching.
            </p>
            <ResumeUploader onSuccess={() => router.refresh()} />
          </div>

          {/* Resume list */}
          {resumes.length > 0 && (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    resume.isActive
                      ? 'border-teal-500/40 bg-teal-500/5'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                        <FileText size={18} className="text-teal-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{resume.fileName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          Uploaded {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(resume.id, resume.isActive)}
                        disabled={toggling === resume.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          resume.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                            : 'bg-white/[0.04] text-slate-500 border border-white/10 hover:text-slate-300 hover:border-white/20'
                        }`}
                        title={resume.isActive ? 'Currently active — click to deactivate' : 'Click to set as active resume'}
                      >
                        {resume.isActive ? (
                          <><ToggleRight size={14} /> Active</>
                        ) : (
                          <><ToggleLeft size={14} /> Inactive</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {resume.skills?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500 mb-2">Extracted Skills</p>
                      <SkillTags skills={resume.skills} max={10} />
                    </div>
                  )}

                  <div className="flex gap-4 mt-3">
                    {resume.yearsExp > 0 && (
                      <span className="text-xs text-slate-500">{resume.yearsExp} yrs experience</span>
                    )}
                    {resume.education?.length > 0 && (
                      <span className="text-xs text-slate-500">{resume.education.length} education entry</span>
                    )}
                    {resume.jobTitle && (
                      <span className="text-xs text-teal-400">{resume.jobTitle}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {resumes.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-teal-400" />
              </div>
              <p className="text-slate-300 font-medium">No resumes uploaded yet</p>
              <p className="text-sm text-slate-500 mt-1">Upload your resume above to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Tailored Resumes Tab ─────────────────────────────── */}
      {activeTab === 'tailored' && (
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-5">
                <FileText size={32} className="text-teal-400" />
              </div>
              <p className="text-white font-semibold text-lg">No tailored resumes yet</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                Go to a saved job and click "Tailored Resume" to generate one optimised for that specific role.
              </p>
              <Link href="/jobs" className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all">
                Browse Jobs →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-5 hover:border-teal-500/30 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.atsScore && <ScoreRing score={Math.round(doc.atsScore)} size={48} />}
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        title="Delete this tailored resume"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-semibold text-white">{doc.job?.title || 'Unknown Role'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building size={11} className="text-teal-400" />
                      <span className="text-xs text-teal-300">{doc.job?.company || 'Unknown Company'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </span>

                    <Link href={`/jobs/${doc.jobId}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-slate-400 text-xs hover:text-white border border-white/5 hover:border-white/20 transition-all">
                      <ExternalLink size={11} /> View Job
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

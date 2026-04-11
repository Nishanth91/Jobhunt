'use client';

import { useState } from 'react';
import { FileText, CheckCircle, Trash2, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ResumeUploader from '@/components/ResumeUploader';
import SkillTags from '@/components/SkillTags';
import { useRouter } from 'next/navigation';

export default function UploadClient({ resumes }) {
  const router = useRouter();
  const [activeResume, setActiveResume] = useState(resumes[0] || null);
  const [toggling, setToggling] = useState(null);

  const handleSuccess = (data) => {
    router.refresh();
  };

  const handleDelete = async (id) => {
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

  return (
    <div className="max-w-4xl space-y-8">
      {/* Upload Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Upload Your Resume</h2>
        <p className="text-sm text-slate-400 mb-5">
          Upload your resume and we'll extract your skills, experience, and education to match you with the best jobs.
        </p>
        <ResumeUploader onSuccess={handleSuccess} />
      </div>

      {/* Resume History */}
      {resumes.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-4">Your Resumes</h3>
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => setActiveResume(resume)}
                className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                  activeResume?.id === resume.id
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <FileText size={18} className="text-indigo-400" />
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
                    {/* Active toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(resume.id, resume.isActive); }}
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
                      onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Skills */}
                {resume.skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500 mb-2">Extracted Skills</p>
                    <SkillTags skills={resume.skills} max={10} />
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 mt-3">
                  {resume.yearsExp > 0 && (
                    <span className="text-xs text-slate-500">{resume.yearsExp} yrs experience</span>
                  )}
                  {resume.education?.length > 0 && (
                    <span className="text-xs text-slate-500">{resume.education.length} education entry</span>
                  )}
                  {resume.jobTitle && (
                    <span className="text-xs text-indigo-400">{resume.jobTitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

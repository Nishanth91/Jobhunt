'use client';

import { FileText, Download, ExternalLink, Building, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ScoreRing } from '@/components/ScoreBadge';

export default function ResumesClient({ documents }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Tailored Resumes</h2>
        <p className="text-sm text-slate-400">
          Resumes customised for specific job openings. Each is optimised with the right keywords for that job's ATS.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20">
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
                {doc.atsScore && <ScoreRing score={Math.round(doc.atsScore)} size={48} />}
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

                <div className="flex gap-2">
                  <Link href={`/jobs/${doc.jobId}`}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-all">
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

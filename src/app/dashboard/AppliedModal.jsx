'use client';

import { useState } from 'react';
import { CheckCircle, X, Calendar, Building2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export default function AppliedModal({ appliedJobs }) {
  const [open, setOpen] = useState(false);
  const count = appliedJobs.length;

  return (
    <>
      {/* Clickable tile — matches StatsCard visually */}
      <button
        onClick={() => count > 0 && setOpen(true)}
        className={`stat-shine relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-5 text-left w-full transition-all duration-300 hover:shadow-glow ${count > 0 ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Applications</p>
            <p className="text-3xl font-bold text-blue-300 tracking-tight">{count}</p>
            <p className="text-xs text-slate-500 mt-1.5">
              {count > 0 ? 'Tap to view details' : 'None sent yet'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl bg-blue-500" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="modal-panel border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-base font-semibold text-white">Applications Sent</h2>
                <p className="text-xs text-slate-400 mt-0.5">{count} total</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white border border-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[60vh] divide-y divide-white/5">
              {appliedJobs.map(({ id, appliedAt, job }) => (
                <div key={id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Briefcase size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{job?.title || 'Unknown Role'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 size={10} className="text-slate-500" />
                        <span className="text-xs text-slate-400">{job?.company || 'Unknown Company'}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar size={10} className="text-slate-600" />
                        <span className="text-[11px] text-slate-500">
                          Applied {format(new Date(appliedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

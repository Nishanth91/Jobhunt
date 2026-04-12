'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResumeUploader({ onSuccess }) {
  const [state, setState] = useState('idle'); // idle | dragging | uploading | success | error
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'];

    if (!allowed.includes(file.type)) {
      setErrorMsg('Please upload a PDF, Word (.docx), or text file.');
      setState('error');
      return;
    }

    setFileName(file.name);
    setState('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setState('success');
      setResult(data);
      onSuccess?.(data);
    } catch (err) {
      setState('error');
      setErrorMsg(err.message);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setState('idle');
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setState('dragging'); }}
        onDragLeave={() => setState('idle')}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          state === 'dragging'
            ? 'border-teal-400 bg-teal-500/10'
            : state === 'success'
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : state === 'error'
            ? 'border-red-500/50 bg-red-500/5'
            : 'border-white/10 hover:border-teal-500/40 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {state === 'uploading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="text-teal-400 animate-spin" />
            <p className="text-slate-300 font-medium">Analysing {fileName}...</p>
            <p className="text-sm text-slate-500">Extracting skills, experience & education</p>
          </div>
        )}

        {state === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={40} className="text-emerald-400" />
            <p className="text-emerald-300 font-medium">Resume analysed successfully!</p>
            <p className="text-sm text-slate-400">{fileName}</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-red-300 font-medium">Upload failed</p>
            <p className="text-sm text-slate-400">{errorMsg}</p>
            <p className="text-xs text-slate-500">Click to try again</p>
          </div>
        )}

        {(state === 'idle' || state === 'dragging') && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Upload size={28} className="text-teal-400" />
            </div>
            <div>
              <p className="text-white font-medium">Drop your resume here</p>
              <p className="text-sm text-slate-400 mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-slate-600">PDF, Word (.docx), or plain text · Max 10MB</p>
          </div>
        )}
      </div>

      {/* Extracted Skills Preview */}
      {state === 'success' && result?.skills?.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
          <p className="text-sm font-semibold text-white">Extracted Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {result.skills.slice(0, 15).map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {skill}
              </span>
            ))}
            {result.skills.length > 15 && (
              <span className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-slate-500">
                +{result.skills.length - 15} more
              </span>
            )}
          </div>
          {result.yearsExp > 0 && (
            <p className="text-xs text-slate-400">Detected ~{result.yearsExp} years of experience</p>
          )}
        </div>
      )}
    </div>
  );
}

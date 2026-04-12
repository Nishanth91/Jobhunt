'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Trophy, TrendingUp, ExternalLink, Play, GraduationCap,
  Sparkles, Target, ChevronDown, ChevronRight, Upload, Settings,
  CheckCircle, AlertCircle, Zap, ArrowRight, Star, Layers,
} from 'lucide-react';

const CATEGORY_CONFIG = {
  highPriority: {
    label: 'High Priority',
    description: 'Directly required for your target roles',
    icon: Target,
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-300',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    glow: 'shadow-red-500/5',
  },
  goodToHave: {
    label: 'Good to Have',
    description: 'Complementary skills that strengthen your profile',
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    glow: 'shadow-blue-500/5',
  },
  emergingTrends: {
    label: 'Emerging Trends',
    description: 'Trending skills that give you a competitive edge',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    glow: 'shadow-cyan-500/5',
  },
};

const RESOURCE_ICON = {
  youtube: Play,
  course: GraduationCap,
  docs: BookOpen,
};

const RESOURCE_COLOR = {
  youtube: 'text-red-400 bg-red-500/10 border-red-500/20',
  course: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  docs: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

function ProgressRing({ percent, size = 120, strokeWidth = 8, color = '#818cf8' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percent}%</span>
        <span className="text-[10px] text-slate-500 mt-0.5">coverage</span>
      </div>
    </div>
  );
}

function SkillCard({ skill, category, resources, isExpanded, onToggle }) {
  const config = CATEGORY_CONFIG[category];
  const skillResources = resources[skill] || [];

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isExpanded
          ? `${config.border} ${config.bg} shadow-lg ${config.glow}`
          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} flex-shrink-0`} />
        <span className="text-sm font-medium text-white flex-1">{skill}</span>
        {skillResources.length > 0 && (
          <span className="text-[10px] text-slate-500 mr-2">
            {skillResources.length} resource{skillResources.length > 1 ? 's' : ''}
          </span>
        )}
        {isExpanded ? (
          <ChevronDown size={14} className="text-slate-500" />
        ) : (
          <ChevronRight size={14} className="text-slate-500" />
        )}
      </button>

      {isExpanded && skillResources.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          <div className="h-px bg-white/5 mb-3" />
          {skillResources.map((resource, i) => {
            const ResIcon = RESOURCE_ICON[resource.type] || BookOpen;
            const colorClass = RESOURCE_COLOR[resource.type] || RESOURCE_COLOR.docs;

            return (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg ${colorClass} border flex items-center justify-center flex-shrink-0`}>
                  <ResIcon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate group-hover:text-teal-200 transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-[10px] text-slate-500">{resource.provider}</p>
                </div>
                <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
              </a>
            );
          })}
        </div>
      )}

      {isExpanded && skillResources.length === 0 && (
        <div className="px-4 pb-4">
          <div className="h-px bg-white/5 mb-3" />
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <Play size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white group-hover:text-teal-200 transition-colors">
                {skill} Tutorial
              </p>
              <p className="text-[10px] text-slate-500">YouTube</p>
            </div>
            <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
          </a>
        </div>
      )}
    </div>
  );
}

function CareerPathVisualization({ careerPaths, yearsExp }) {
  // Determine current level based on years of experience
  const getCurrentLevel = () => {
    if (yearsExp <= 2) return 0;
    if (yearsExp <= 5) return 1;
    if (yearsExp <= 10) return 2;
    if (yearsExp <= 15) return 3;
    return 4;
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="space-y-6">
      {careerPaths.map(({ role, path }, pathIdx) => (
        <div key={pathIdx}>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers size={14} className="text-teal-400" />
            {role}
          </h4>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-teal-500/40 via-cyan-500/40 to-teal-500/40" />

            <div className="space-y-3">
              {path.map((step, idx) => {
                const isCurrent = idx === currentLevel;
                const isPast = idx < currentLevel;
                const isFuture = idx > currentLevel;

                return (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Node */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 border-teal-400/50 shadow-lg shadow-teal-500/20'
                          : isPast
                          ? 'bg-emerald-500/20 border-emerald-500/30'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : isCurrent ? (
                        <Star size={16} className="text-white" />
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">{idx + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 rounded-xl px-4 py-3 border transition-all ${
                        isCurrent
                          ? 'bg-teal-500/10 border-teal-500/20'
                          : isPast
                          ? 'bg-emerald-500/5 border-emerald-500/10'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isCurrent ? 'text-teal-400' : isPast ? 'text-emerald-500' : 'text-slate-600'
                          }`}
                        >
                          {step.level}
                          {isCurrent && ' (You are here)'}
                        </span>
                      </div>
                      <h5 className={`text-sm font-medium ${isFuture ? 'text-slate-400' : 'text-white'}`}>
                        {step.title}
                      </h5>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.skills.map((s) => (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              isCurrent
                                ? 'bg-teal-500/15 text-teal-300 border-teal-500/20'
                                : isPast
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-white/[0.03] text-slate-500 border-white/5'
                            }`}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CareerClient({
  analysis,
  resumeSkills,
  resumeJobTitle,
  yearsExp,
  targetRoles,
  hasResume,
  hasPreferences,
}) {
  const [expandedSkills, setExpandedSkills] = useState({});
  const [activeTab, setActiveTab] = useState('skills');

  const toggleSkill = (skill) => {
    setExpandedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  // No data state
  if (!hasResume && !hasPreferences) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={28} className="text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Career Guidance</h2>
        <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Upload your resume and set your job preferences to get personalized career guidance, skill gap analysis, and learning recommendations.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all"
          >
            <Upload size={14} /> Upload Resume
          </Link>
          <Link
            href="/preferences"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 border border-cyan-500/20 transition-all"
          >
            <Settings size={14} /> Set Preferences
          </Link>
        </div>
      </div>
    );
  }

  const {
    matchedRoles,
    highPriority,
    goodToHave,
    emergingTrends,
    matchedSkills,
    topStrengths,
    personalInsight,
    coveragePercent,
    overallCoverage,
    careerPaths,
    resources,
    totalRequired,
    coveredRequired,
  } = analysis;

  const skillCategories = [
    { key: 'highPriority', skills: highPriority },
    { key: 'goodToHave', skills: goodToHave },
    { key: 'emergingTrends', skills: emergingTrends },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Career Guidance</h2>
        <p className="text-sm text-slate-400">
          Personalized skill analysis and learning roadmap based on your profile and target roles.
        </p>
      </div>

      {/* Personalized Insight Banner */}
      {personalInsight && (
        <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 px-5 py-4 flex items-start gap-3">
          <Sparkles size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-200 leading-relaxed">{personalInsight}</p>
            {topStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {topStrengths.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-teal-500/20 text-teal-300 border border-teal-500/20">
                    ✓ {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role Match Card */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-teal-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Roles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedRoles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-200 text-xs border border-teal-500/20 font-medium"
              >
                {role}
              </span>
            ))}
          </div>
          {resumeJobTitle && (
            <p className="text-[10px] text-slate-500 mt-3">
              Current: {resumeJobTitle} {yearsExp > 0 && `(${yearsExp} yrs exp)`}
            </p>
          )}
        </div>

        {/* Core Skills Coverage */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Skills</span>
              </div>
              <p className="text-3xl font-bold text-white">{coveredRequired}<span className="text-lg text-slate-500">/{totalRequired}</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Required skills covered</p>
            </div>
            <ProgressRing percent={coveragePercent} size={80} strokeWidth={6} color="#f59e0b" />
          </div>
        </div>

        {/* Overall Coverage */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-emerald-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall</span>
              </div>
              <p className="text-3xl font-bold text-white">{overallCoverage}<span className="text-lg text-slate-500">%</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Total skill coverage</p>
            </div>
            <ProgressRing percent={overallCoverage} size={80} strokeWidth={6} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
        {[
          { key: 'skills', label: 'Skill Gap Analysis', icon: Target },
          { key: 'path', label: 'Career Path', icon: ArrowRight },
          { key: 'current', label: 'Your Skills', icon: CheckCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'skills' && (
        <div className="space-y-8">
          {skillCategories.map(({ key, skills }) => {
            const config = CATEGORY_CONFIG[key];
            const Icon = config.icon;

            if (skills.length === 0) return null;

            return (
              <div key={key}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{config.label}</h3>
                    <p className="text-[10px] text-slate-500">{config.description}</p>
                  </div>
                  <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-medium border ${config.badge}`}>
                    {skills.length} skill{skills.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {skills.map((skill) => (
                    <SkillCard
                      key={skill}
                      skill={skill}
                      category={key}
                      resources={resources}
                      isExpanded={!!expandedSkills[skill]}
                      onToggle={() => toggleSkill(skill)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {highPriority.length === 0 && goodToHave.length === 0 && emergingTrends.length === 0 && (
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-8 text-center">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">Excellent Coverage!</h3>
              <p className="text-sm text-slate-400">
                Your skills align well with your target roles. Keep learning to stay ahead!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'path' && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 backdrop-blur-sm">
          {careerPaths.length > 0 ? (
            <CareerPathVisualization careerPaths={careerPaths} yearsExp={yearsExp} />
          ) : (
            <div className="text-center py-8">
              <AlertCircle size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No career path data available for your target roles.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'current' && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Skills You Already Have</h3>
            <span className="ml-auto text-xs text-slate-500">{matchedSkills.length} matched</span>
          </div>

          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 font-medium"
                >
                  <CheckCircle size={10} />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No matching skills detected from your resume.</p>
          )}

          {resumeSkills.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">All Resume Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {resumeSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 text-xs border border-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompt to complete profile */}
      {(!hasResume || !hasPreferences) && (
        <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {!hasResume ? 'Upload your resume for better analysis' : 'Set your target roles for better guidance'}
              </h3>
              <p className="text-xs text-slate-400">
                {!hasResume
                  ? 'Your resume skills will be matched against role requirements to identify gaps.'
                  : 'Adding target roles helps us provide more relevant skill recommendations.'}
              </p>
            </div>
            <Link
              href={!hasResume ? '/upload' : '/preferences'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-sm font-medium hover:bg-teal-500/30 border border-teal-500/20 transition-all flex-shrink-0"
            >
              {!hasResume ? <Upload size={14} /> : <Settings size={14} />}
              {!hasResume ? 'Upload Resume' : 'Set Preferences'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

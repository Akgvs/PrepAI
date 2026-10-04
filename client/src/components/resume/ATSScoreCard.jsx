import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import Button from '../common/Button.jsx';

const ATSScoreCard = ({ atsScore, onScore, loading }) => {
  if (!atsScore || atsScore.overall === null || atsScore.overall === undefined) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Unscored Resume</h3>
        <p className="text-sm text-slate-400 mb-6">
          Generate an ATS score to see how well your resume matches up against Applicant Tracking Systems.
        </p>
        <Button onClick={onScore} loading={loading} variant="primary" icon={Zap} className="w-full">
          Analyze & Score
        </Button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-400';
    if (score >= 60) return 'text-amber-400 border-amber-400';
    return 'text-rose-400 border-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 60) return 'bg-amber-500/10';
    return 'bg-rose-500/10';
  };

  const getSectionIcon = (score) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          ATS Score
        </h3>
        <Button onClick={onScore} loading={loading} variant="secondary" size="xs" icon={Zap}>
          Re-score
        </Button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${getScoreColor(
            atsScore.overall
          )} ${getScoreBg(atsScore.overall)} mb-3 shadow-lg`}
        >
          <span className="text-4xl font-extrabold font-heading">{atsScore.overall}</span>
          <span className="text-sm font-bold ml-1">%</span>
        </div>
        <p className="text-sm font-medium text-slate-300">
          {atsScore.overall >= 80
            ? 'Excellent! Highly ATS-optimized.'
            : atsScore.overall >= 60
            ? 'Good, but needs some optimization.'
            : 'Poor ATS compatibility.'}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Section Scores
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(atsScore.sections || {}).map(([key, value]) => (
            <div key={key} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs text-slate-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${getScoreColor(value).split(' ')[0]}`}>
                  {value}%
                </span>
                {getSectionIcon(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {atsScore.suggestions?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            AI Suggestions
          </h4>
          <ul className="space-y-2">
            {atsScore.suggestions.map((s, idx) => (
              <li key={idx} className="text-xs text-slate-400 flex items-start gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {atsScore.keywords?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Suggested Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {atsScore.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSScoreCard;

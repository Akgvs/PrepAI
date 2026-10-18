import { Sparkles } from 'lucide-react';

const QuestionNavigator = ({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  onJumpToIndex,
}) => {
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <h3 className="text-sm font-bold font-heading text-white mb-3 flex items-center justify-between">
          <span>Question Matrix</span>
          <span className="text-xs font-mono text-purple-400">
            {answeredCount}/{totalQuestions} Answered
          </span>
        </h3>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Pills Matrix */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onJumpToIndex(idx)}
                className={`h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'border-2 border-purple-400 bg-purple-500/20 text-white shadow-md'
                    : isAnswered
                    ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30 hover:bg-purple-800/50'
                    : 'bg-slate-900/60 text-slate-500 border border-white/5 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-900/50 border border-purple-500/30" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-900 border border-white/5" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded border-2 border-purple-400" />
            <span>Current Question</span>
          </div>
        </div>
      </div>

      {/* Quick Test Guidance */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5 text-xs text-slate-400 space-y-2">
        <span className="text-slate-300 font-semibold block flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Exam Rules
        </span>
        <p>All questions are weighted equally. Answers are autosaved as you click.</p>
        <p>You can freely jump between questions before finalizing your submission.</p>
      </div>
    </div>
  );
};

export default QuestionNavigator;

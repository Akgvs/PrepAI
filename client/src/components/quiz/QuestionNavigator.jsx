import { Terminal } from 'lucide-react';

const QuestionNavigator = ({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  onJumpToIndex,
}) => {
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5 bg-[#12151e] border border-white/8 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-medium">Question Matrix</span>
          <span className="text-slate-400">
            {answeredCount}/{totalQuestions} recorded
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#181c28] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Grid of question buttons */}
        <div className="grid grid-cols-5 gap-2 pt-1 font-mono">
          {Array.from({ length: totalQuestions }, (_, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedAnswers[idx] !== undefined;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onJumpToIndex(idx)}
                className={`h-9 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : isAnswered
                    ? 'bg-[#121c17] text-emerald-300 border border-emerald-500/20 hover:bg-[#16231c]'
                    : 'bg-[#161a24] text-slate-400 border border-white/8 hover:text-white hover:border-white/20'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-white/8 space-y-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#121c17] border border-emerald-500/20" />
            <span>Recorded ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-white" />
            <span>Active Question</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#161a24] border border-white/8" />
            <span>Unanswered ({totalQuestions - answeredCount})</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-[#12151e] border border-white/8 text-xs text-slate-400 space-y-1.5 leading-relaxed">
        <span className="text-slate-200 font-medium block flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-slate-400" /> Assessment Rules
        </span>
        <p>• One correct answer per question.</p>
        <p>• Questions can be revisited at any time before submission.</p>
        <p>• Assessment will auto-grade when timer expires.</p>
      </div>
    </div>
  );
};

export default QuestionNavigator;

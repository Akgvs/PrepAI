import { useState } from 'react';
import { Clock, Terminal, Code2, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuizReviewSection = ({ quiz, onNewQuizClick }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'

  const isPassing = quiz.passed;
  const totalQuestions = quiz.questions?.length || 0;
  const elapsedMins = Math.round((quiz.timeSpentSeconds || 0) / 60);
  const elapsedSecs = (quiz.timeSpentSeconds || 0) % 60;

  const filteredQuestions = (quiz.questions || []).filter((q) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hero Score Overview Card */}
      <div className="rounded-xl p-6 sm:p-7 bg-[#12151e] border border-white/8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
            {/* Box Score */}
            <div
              className={`p-4 rounded-xl flex flex-col items-center justify-center border min-w-[110px] shrink-0 font-mono ${
                isPassing
                  ? 'border-emerald-500/30 bg-[#121c17] text-emerald-400'
                  : 'border-rose-500/30 bg-[#1a1215] text-rose-400'
              }`}
            >
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {quiz.percentage}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                {quiz.score}/{totalQuestions} Correct
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
                <Badge variant={isPassing ? 'emerald' : 'rose'} size="sm" dot>
                  {isPassing ? 'Benchmark Satisfied' : 'Below 60% Threshold'}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {elapsedMins}m {elapsedSecs}s duration
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
                {isPassing ? 'Strong Engineering Depth' : 'Targeted Concept Review Required'}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                {quiz.performanceSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <Button variant="primary" onClick={onNewQuizClick} icon={ArrowRight} iconPosition="right">
              Start new assessment
            </Button>
          </div>
        </div>
      </div>

      {quiz.isArchived && (
        <div className="p-3.5 rounded-lg border border-white/8 bg-[#161a24] text-slate-400 text-xs leading-relaxed flex items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          <span>
            This assessment is older than the storage retention policy window. Full question answer text has been compressed, but your high-level telemetry and percentage scores remain permanently preserved.
          </span>
        </div>
      )}

      {/* Solutions Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/8 pb-3.5">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Detailed Solutions & Explanations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review selections, correct choices, and architectural insights.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#12151e] border border-white/8">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalQuestions})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'incorrect'
                ? 'bg-white text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incorrect ({quiz.questions.filter((q) => !q.isCorrect).length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              filter === 'correct'
                ? 'bg-white text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Correct ({quiz.questions.filter((q) => q.isCorrect).length})
          </button>
        </div>
      </div>

      {/* Questions Solution List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-xs font-mono text-slate-500 rounded-xl bg-[#12151e] border border-white/8">
          No questions found for the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const questionNumber =
              quiz.questions.findIndex((item) => item._id === q._id) + 1;
            const isCorrect = q.isCorrect;

            return (
              <div
                key={q._id || idx}
                className={`rounded-xl p-5 border transition-colors ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-[#121c17]'
                    : 'border-rose-500/20 bg-[#181216]'
                }`}
              >
                {/* Meta */}
                <div className="flex items-center justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Question {questionNumber}
                    </span>
                    <Badge variant={isCorrect ? 'emerald' : 'rose'} size="sm" dot>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>
                  <Badge variant="slate" size="sm">
                    {q.topicTag || 'Core Topic'}
                  </Badge>
                </div>

                {/* Prompt */}
                <h3 className="text-sm font-semibold text-white mb-3">
                  {q.question}
                </h3>

                {/* Code Snippet */}
                {q.codeSnippet && (
                  <div className="mb-3.5 rounded-lg overflow-hidden border border-white/8 bg-[#0c0e14] p-3 font-mono text-xs text-sky-200">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 border-b border-white/5 pb-1">
                      <Code2 className="h-3 w-3" />
                      <span>Code Snippet</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Choices breakdown */}
                <div className="space-y-2 mb-3.5">
                  {q.options?.map((opt, oIdx) => {
                    const isCorrectOption = oIdx === q.correctAnswer;
                    const isUserChoice = oIdx === q.userAnswer;

                    let style = 'border-white/5 bg-[#0c0e14]/50 text-slate-400';
                    if (isCorrectOption) {
                      style =
                        'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 font-medium';
                    } else if (isUserChoice && !isCorrectOption) {
                      style =
                        'border-rose-500/40 bg-rose-500/10 text-rose-200 font-medium';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${style}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-xs font-semibold pt-0.5">
                            {OPTION_LETTERS[oIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="shrink-0">
                          {isCorrectOption && (
                            <Badge variant="emerald" size="sm">
                              Correct Choice
                            </Badge>
                          )}
                          {isUserChoice && !isCorrectOption && (
                            <Badge variant="rose" size="sm">
                              Your Choice
                            </Badge>
                          )}
                          {isUserChoice && isCorrectOption && (
                            <Badge variant="emerald" size="sm">
                              Your Choice (Correct)
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="rounded-lg p-3.5 bg-[#0c0e14] border border-white/8 text-xs leading-relaxed text-slate-300">
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px] uppercase tracking-wider mb-1">
                      <Terminal className="h-3 w-3" />
                      <span>Conceptual Breakdown</span>
                    </div>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizReviewSection;

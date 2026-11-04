import { useState } from 'react';
import { Clock, Sparkles, Code2 } from 'lucide-react';
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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-950/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center sm:text-left flex-col sm:flex-row">
            {/* Radial / Box Score */}
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center border-2 shrink-0 ${
                isPassing
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/20'
              }`}
            >
              <span className="text-3xl sm:text-4xl font-extrabold font-heading">
                {quiz.percentage}%
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                {quiz.score}/{totalQuestions} Correct
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
                <Badge variant={isPassing ? 'emerald' : 'rose'} size="md" dot>
                  {isPassing ? 'Assessment Passed' : 'Did Not Meet 60% Benchmark'}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  {elapsedMins}m {elapsedSecs}s
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                {isPassing ? 'Strong Engineering Depth' : 'Targeted Practice Recommended'}
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {quiz.performanceSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button variant="primary" onClick={onNewQuizClick} icon={Sparkles}>
              Practice Another Quiz
            </Button>
          </div>
        </div>
      </div>

      {quiz.isArchived && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs leading-relaxed flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0 text-indigo-400" />
          <span>
            This assessment is older than your retention policy threshold. Detailed question options and explanations have been pruned to optimize database storage, but your high-level scores and benchmark metrics remain permanently preserved.
          </span>
        </div>
      )}

      {/* Solutions Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">
            Detailed Solutions & Explanations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your selections, correct answers, and AI-curated engineering insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalQuestions})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'incorrect'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incorrect ({quiz.questions.filter((q) => !q.isCorrect).length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'correct'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Correct ({quiz.questions.filter((q) => q.isCorrect).length})
          </button>
        </div>
      </div>

      {/* Questions Solution List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400 glass-panel rounded-2xl">
          No questions found for the selected filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const questionNumber =
              quiz.questions.findIndex((item) => item._id === q._id) + 1;
            const isCorrect = q.isCorrect;

            return (
              <div
                key={q._id || idx}
                className={`glass-panel rounded-2xl p-6 border transition-all ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-rose-500/20 bg-rose-950/10'
                }`}
              >
                {/* Meta */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
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
                <h3 className="text-base font-bold text-white font-heading mb-3">
                  {q.question}
                </h3>

                {/* Code Snippet */}
                {q.codeSnippet && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 p-3.5 font-mono text-xs text-indigo-200">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 border-b border-white/5 pb-1">
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Code Snippet</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Choices breakdown */}
                <div className="space-y-2 mb-4">
                  {q.options?.map((opt, oIdx) => {
                    const isCorrectOption = oIdx === q.correctAnswer;
                    const isUserChoice = oIdx === q.userAnswer;

                    let style = 'border-white/5 bg-slate-900/30 text-slate-400';
                    if (isCorrectOption) {
                      style =
                        'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                    } else if (isUserChoice && !isCorrectOption) {
                      style =
                        'border-rose-500/60 bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/40';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border text-sm flex items-start justify-between gap-3 ${style}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-bold pt-0.5">
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

                {/* AI Explanation Box */}
                {q.explanation && (
                  <div className="rounded-xl p-4 bg-slate-900/80 border border-purple-500/20 text-xs leading-relaxed text-slate-300">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Conceptual Explanation</span>
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

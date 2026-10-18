import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Code2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../services/quiz.service.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import QuestionNavigator from '../components/quiz/QuestionNavigator.jsx';
import QuizReviewSection from '../components/quiz/QuizReviewSection.jsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuizSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quizService.getById(id);
      const data = res.data;
      setQuiz(data);

      if (data.status === 'completed') {
        const answersMap = {};
        data.questions.forEach((q, idx) => {
          if (q.userAnswer !== null && q.userAnswer !== undefined) {
            answersMap[idx] = q.userAnswer;
          }
        });
        setSelectedAnswers(answersMap);
      } else {
        const totalSeconds = (data.timeLimitMinutes || 10) * 60;
        setTimeRemaining(totalSeconds);
        startTimeRef.current = Date.now();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load quiz session');
      navigate('/dashboard/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting || !quiz || quiz.status === 'completed') return;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setSubmitting(true);
      if (isAutoSubmit) {
        toast('Time is up! Submitting answers...', { icon: '⏰' });
      }

      try {
        const payloadAnswers = quiz.questions.map((q, idx) => ({
          questionId: q._id,
          questionIndex: idx,
          selectedOption:
            selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null,
        }));

        const elapsedSeconds = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        const res = await quizService.submit(id, {
          answers: payloadAnswers,
          timeSpentSeconds: elapsedSeconds,
        });

        setQuiz(res.data);
        setConfirmSubmitOpen(false);
        setCurrentIndex(0);
        toast.success('Quiz submitted! Check your score & concept review below.');
      } catch (err) {
        toast.error(err.message || 'Failed to submit quiz');
      } finally {
        setSubmitting(false);
      }
    },
    [id, quiz, selectedAnswers, submitting]
  );

  // Active Timer countdown
  useEffect(() => {
    if (!quiz || quiz.status === 'completed') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, handleSubmit]);

  const handleSelectOption = (optIndex) => {
    if (quiz?.status === 'completed') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm">Preparing assessment environment...</p>
      </div>
    );
  }

  const isCompleted = quiz.status === 'completed';
  const totalQuestions = quiz.questions?.length || 0;
  const currentQuestion = quiz.questions?.[currentIndex] || {};
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Session Top Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/quizzes')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Back to Quizzes"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono uppercase text-purple-400 font-semibold">
                {quiz.topic}
              </span>
              <Badge variant="indigo" size="sm">
                {quiz.difficulty}
              </Badge>
              {isCompleted ? (
                <Badge variant={quiz.passed ? 'emerald' : 'rose'} size="sm" dot>
                  {quiz.passed ? 'Passed' : 'Needs Practice'}
                </Badge>
              ) : (
                <Badge variant="amber" size="sm" dot>
                  Live Assessment
                </Badge>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-heading text-white line-clamp-1">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Status / Timer */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {!isCompleted ? (
            <>
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold ${
                  timeRemaining < 120
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                    : 'bg-slate-900/80 text-purple-300 border-purple-500/30'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={() => setConfirmSubmitOpen(true)}
              >
                Finish Quiz
              </Button>
            </>
          ) : (
            <Link to="/dashboard/quizzes">
              <Button variant="secondary" size="sm" icon={RotateCcw}>
                Back to All Quizzes
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* COMPLETED MODE: Results & Solutions */}
      {isCompleted ? (
        <QuizReviewSection
          quiz={quiz}
          onNewQuizClick={() => navigate('/dashboard/quizzes')}
        />
      ) : (
        /* ACTIVE TEST MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Card (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative">
              <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400">
                  Question <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
                  <span className="text-white font-bold">{totalQuestions}</span>
                </span>
                <Badge variant="purple" size="sm">
                  {currentQuestion.topicTag || quiz.topic}
                </Badge>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white font-heading leading-relaxed mb-4">
                {currentQuestion.question}
              </h2>

              {currentQuestion.codeSnippet && (
                <div className="mb-6 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 p-4 font-mono text-xs text-indigo-200">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-2 border-b border-white/5 pb-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Code Snippet</span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                {currentQuestion.options?.map((optionText, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/15 text-white ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                          : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20 hover:bg-slate-900/80 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {OPTION_LETTERS[optIdx] || optIdx + 1}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>

                <div className="text-xs text-slate-400 hidden sm:block">
                  {selectedAnswers[currentIndex] !== undefined ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answer Recorded
                    </span>
                  ) : (
                    <span className="text-slate-500">Select an option to record answer</span>
                  )}
                </div>

                {currentIndex < totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ChevronRight}
                    iconPosition="right"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => setConfirmSubmitOpen(true)}
                  >
                    Review & Submit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Matrix Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <QuestionNavigator
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              selectedAnswers={selectedAnswers}
              onJumpToIndex={(idx) => setCurrentIndex(idx)}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        title="Submit Assessment?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to finalize and grade your test answers?
          </p>

          {unansweredCount > 0 && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  {unansweredCount} Unanswered Question{unansweredCount > 1 ? 's' : ''}
                </span>
                Any questions left blank will be evaluated as incorrect.
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setConfirmSubmitOpen(false)}
            >
              Continue Working
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={() => handleSubmit(false)}
              icon={Send}
            >
              Grade Test Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizSessionPage;

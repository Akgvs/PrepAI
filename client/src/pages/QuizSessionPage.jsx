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
        toast('Time is up. Submitting answers...', { icon: '⏰' });
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
        toast.success('Assessment submitted. Viewing score & explanations.');
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
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-3" />
        <p className="text-xs font-mono">Preparing assessment environment...</p>
      </div>
    );
  }

  const isCompleted = quiz.status === 'completed';
  const totalQuestions = quiz.questions?.length || 0;
  const currentQuestion = quiz.questions?.[currentIndex] || {};
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Session Top Header */}
      <div className="rounded-xl p-4 sm:p-5 bg-[#12151e] border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/quizzes')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Back to Quizzes"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono uppercase text-slate-400">
                {quiz.topic}
              </span>
              <Badge variant="slate" size="sm">
                {quiz.difficulty}
              </Badge>
              {isCompleted ? (
                <Badge variant={quiz.passed ? 'emerald' : 'rose'} size="sm" dot>
                  {quiz.passed ? 'Passed' : 'Needs Practice'}
                </Badge>
              ) : (
                <Badge variant="amber" size="sm" dot>
                  Active Session
                </Badge>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-1">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Status / Timer */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {!isCompleted ? (
            <>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-md border font-mono text-xs ${
                  timeRemaining < 120
                    ? 'bg-[#1a1215] text-rose-300 border-rose-500/30'
                    : 'bg-[#0c0e14] text-slate-200 border-white/8'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="tabular-nums">{formatTimer(timeRemaining)}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={() => setConfirmSubmitOpen(true)}
              >
                Submit Assessment
              </Button>
            </>
          ) : (
            <Link to="/dashboard/quizzes">
              <Button variant="secondary" size="sm" icon={RotateCcw}>
                Back to all quizzes
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Question Card (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-xl p-5 sm:p-6 bg-[#12151e] border border-white/8 relative">
              <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/8">
                <span className="text-xs font-mono text-slate-400">
                  Question <span className="text-white font-medium">{currentIndex + 1}</span> of{' '}
                  <span className="text-white font-medium">{totalQuestions}</span>
                </span>
                <Badge variant="slate" size="sm">
                  {currentQuestion.topicTag || quiz.topic}
                </Badge>
              </div>

              <h2 className="text-sm sm:text-base font-semibold text-white leading-relaxed mb-4">
                {currentQuestion.question}
              </h2>

              {currentQuestion.codeSnippet && (
                <div className="mb-4 rounded-lg overflow-hidden border border-white/8 bg-[#0c0e14] p-3 font-mono text-xs text-sky-200">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 border-b border-white/5 pb-1">
                    <Code2 className="h-3 w-3" />
                    <span>Code Snippet</span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="space-y-2.5">
                {currentQuestion.options?.map((optionText, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-sky-500/60 bg-[#162030] text-white shadow-sm'
                          : 'border-white/8 bg-[#0c0e14] text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-medium shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'bg-[#181c28] text-slate-400'
                        }`}
                      >
                        {OPTION_LETTERS[optIdx] || optIdx + 1}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/8">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>

                <div className="text-xs font-mono text-slate-400 hidden sm:block">
                  {selectedAnswers[currentIndex] !== undefined ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Answer Recorded
                    </span>
                  ) : (
                    <span className="text-slate-500">Select an option</span>
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
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to finalize and grade your test answers?
          </p>

          {unansweredCount > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {unansweredCount} Unanswered Question{unansweredCount > 1 ? 's' : ''}
                </span>
                Any questions left blank will be graded as incorrect.
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/8">
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
              Grade Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizSessionPage;

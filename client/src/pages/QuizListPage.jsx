import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Clock,
  Calendar,
  Trash2,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import quizService from '../services/quiz.service.js';
import useUsageQuota from '../hooks/useUsageQuota.js';
import UpgradeModal from '../components/pricing/UpgradeModal.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import CreateQuizModal from '../components/quiz/CreateQuizModal.jsx';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'in-progress'

  const { refreshUsage, getQuotaFor } = useUsageQuota();
  const quota = getQuotaFor('quizzesGenerated');

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quizService.getAll();
      setQuizzes(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleOpenCreateModal = () => {
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quiz limit reached. Upgrade for unlimited quizzes.');
      setUpgradeModalOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCreate = async (formData) => {
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quiz limit reached. Upgrade for unlimited quizzes.');
      setUpgradeModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizService.create(formData);
      toast.success('Assessment generated. Starting session.');
      setOpenDialog(false);
      refreshUsage();
      navigate(`/dashboard/quizzes/${res.data._id}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to generate quiz';
      toast.error(errMsg);
      if (err.response?.status === 429 || errMsg.includes('limit reached')) {
        setUpgradeModalOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz record?')) return;
    try {
      await quizService.delete(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      toast.success('Quiz deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'completed') return q.status === 'completed';
    if (filter === 'in-progress') return q.status !== 'completed';
    return true;
  });

  const completedList = quizzes.filter((q) => q.status === 'completed');
  const scores = completedList
    .map((q) => q.percentage)
    .filter((p) => p !== null && p !== undefined);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const passCount = completedList.filter((q) => q.passed).length;
  const passRate = completedList.length
    ? Math.round((passCount / completedList.length) * 100)
    : null;
  const totalQuestionsAnswered = completedList.reduce(
    (acc, q) => acc + (q.numberOfQuestions || 0),
    0
  );

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <Badge variant="emerald" size="sm">Easy</Badge>;
      case 'medium':
        return <Badge variant="slate" size="sm">Medium</Badge>;
      case 'hard':
        return <Badge variant="rose" size="sm">Hard</Badge>;
      default:
        return <Badge variant="slate" size="sm">Adaptive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/8">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <Badge variant="slate" size="sm" dot>
              Adaptive Assessments
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Skill Diagnostic Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Timed scenario and edge-case multiple choice assessments with server-side validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {quota.isUnlimited ? (
            <Badge variant="sky" size="sm" dot>
              Professional Plan
            </Badge>
          ) : (
            <Badge variant="slate" size="sm">
              <span className="text-slate-300 font-mono">
                {quota.remaining} of {quota.limit} quizzes remaining
              </span>
            </Badge>
          )}

          <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus}>
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-[#12151e] border border-white/8">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Assessments Taken
          </span>
          <span className="text-2xl font-mono font-semibold text-white tracking-tight tabular-nums">
            {quizzes.length}
          </span>
        </div>

        <div className="rounded-xl p-4 bg-[#12151e] border border-white/8">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Average Score
          </span>
          <span className="text-2xl font-mono font-semibold text-white tracking-tight tabular-nums">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </span>
        </div>

        <div className="rounded-xl p-4 bg-[#12151e] border border-white/8">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Pass Rate (≥60%)
          </span>
          <span className="text-2xl font-mono font-semibold text-emerald-400 tracking-tight tabular-nums">
            {passRate !== null ? `${passRate}%` : '—'}
          </span>
        </div>

        <div className="rounded-xl p-4 bg-[#12151e] border border-white/8">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Questions Solved
          </span>
          <span className="text-2xl font-mono font-semibold text-white tracking-tight tabular-nums">
            {totalQuestionsAnswered}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#12151e] border border-white/8 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({quizzes.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
            filter === 'completed'
              ? 'bg-white text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed ({completedList.length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
            filter === 'in-progress'
              ? 'bg-white text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          In Progress ({quizzes.length - completedList.length})
        </button>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-slate-400">
          <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto mb-3" />
          Loading assessment telemetry...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            filter === 'all'
              ? 'No quizzes taken yet'
              : filter === 'completed'
              ? 'No completed quizzes'
              : 'No in-progress quizzes'
          }
          description="Test your skills across frontend, backend, databases, or system design with AI-curated timed questions."
          actionText="Create Assessment"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = quiz.status === 'completed';
            const isPassing = quiz.passed;

            return (
              <div
                key={quiz._id}
                onClick={() => navigate(`/dashboard/quizzes/${quiz._id}`)}
                className="rounded-xl p-5 bg-[#12151e] border border-white/8 hover:border-white/20 flex flex-col justify-between transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 line-clamp-1">
                      {quiz.topic}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getDifficultyBadge(quiz.difficulty)}
                      {isCompleted ? (
                        <Badge variant={isPassing ? 'emerald' : 'rose'} size="sm" dot>
                          {quiz.percentage}%
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm" dot>
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-1">
                    {quiz.title}
                  </h3>

                  {quiz.techStack && (
                    <p className="text-xs text-slate-400 mb-3.5 line-clamp-1 font-mono">
                      {quiz.techStack}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-[#0c0e14] rounded-lg border border-white/8 mb-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="h-3 w-3 text-slate-500" />
                      <span>{quiz.numberOfQuestions} Qs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>
                        {isCompleted
                          ? `${Math.round((quiz.timeSpentSeconds || 0) / 60)}m`
                          : `${quiz.timeLimitMinutes || 10}m limit`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 text-slate-500 text-[11px]">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/8 mt-auto">
                  <button
                    onClick={(e) => handleDelete(quiz._id, e)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <Button
                    variant={isCompleted ? 'secondary' : 'primary'}
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {isCompleted ? 'Review answers' : 'Resume quiz'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CreateQuizModal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade for Unlimited Quizzes"
        message="You have utilized your free quiz quota. Unlock unmetered assessments with the Professional tier."
      />
    </div>
  );
};

export default QuizListPage;

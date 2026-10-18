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
  Sparkles,
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
      toast.error('Free plan quiz limit reached. Upgrade to Pro for unlimited quizzes.');
      setUpgradeModalOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCreate = async (formData) => {
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quiz limit reached. Upgrade to Pro for unlimited quizzes.');
      setUpgradeModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await quizService.create(formData);
      toast.success('Quiz generated! Best of luck on your assessment.');
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
        return <Badge variant="indigo" size="sm">Medium</Badge>;
      case 'hard':
        return <Badge variant="rose" size="sm">Hard</Badge>;
      default:
        return <Badge variant="purple" size="sm">Adaptive</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Smart MCQ Quizzes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Test technical depth with AI-generated timed tests, instant grading, and comprehensive concept breakdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {quota.isUnlimited ? (
            <Badge variant="indigo" size="md" dot>
              <Sparkles className="h-3 w-3 mr-1 inline text-yellow-300" />
              Unlimited Pro Tier
            </Badge>
          ) : (
            <Badge variant="slate" size="md">
              <span className="text-slate-300">
                {quota.remaining} of {quota.limit} Quizzes Left
              </span>
            </Badge>
          )}

          <Button onClick={handleOpenCreateModal} variant="primary" icon={Plus}>
            Create New Quiz
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Quizzes Taken</span>
            <span className="text-2xl font-bold font-heading text-white">{quizzes.length}</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Average Score</span>
            <span className="text-2xl font-bold font-heading text-white">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pass Rate (≥60%)</span>
            <span className="text-2xl font-bold font-heading text-white">
              {passRate !== null ? `${passRate}%` : '—'}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Questions Solved</span>
            <span className="text-2xl font-bold font-heading text-white">
              {totalQuestionsAnswered}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Completed ({completedList.length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filter === 'in-progress'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          In Progress ({quizzes.length - completedList.length})
        </button>
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
          Loading your quiz assessments...
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
          actionText="Create Your First Quiz"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const isCompleted = quiz.status === 'completed';
            const isPassing = quiz.passed;

            return (
              <div
                key={quiz._id}
                onClick={() => navigate(`/dashboard/quizzes/${quiz._id}`)}
                className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between group border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-medium text-purple-400 uppercase tracking-wider line-clamp-1">
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

                  <h3 className="text-lg font-bold font-heading text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                    {quiz.title}
                  </h3>

                  {quiz.techStack && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-1">
                      Stack: {quiz.techStack}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 py-3 px-3.5 bg-slate-900/60 rounded-xl border border-white/5 mb-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>{quiz.numberOfQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {isCompleted
                          ? `${Math.round((quiz.timeSpentSeconds || 0) / 60)}m spent`
                          : `${quiz.timeLimitMinutes || 10}m limit`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                  <button
                    onClick={(e) => handleDelete(quiz._id, e)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Button
                    variant={isCompleted ? 'secondary' : 'primary'}
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {isCompleted ? 'Review Explanations' : 'Resume Quiz'}
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
        message="You have utilized your free quiz quota for this billing period. Unlock unlimited AI assessments, custom tech stacks, and priority Gemini generation."
      />
    </div>
  );
};

export default QuizListPage;

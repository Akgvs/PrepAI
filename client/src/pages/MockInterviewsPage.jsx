import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Video,
  Trash2,
  Calendar,
  Play,
  FileCheck,
  Layers,
  AlertCircle,
  Zap,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import interviewService from '../services/interview.service.js';
import useUsageQuota from '../hooks/useUsageQuota.js';
import UpgradeModal from '../components/pricing/UpgradeModal.jsx';
import {
  EXPERIENCE_LEVELS,
  DIFFICULTY_LEVELS,
  INTERVIEW_TYPES,
  QUESTION_COUNTS,
} from '../utils/constants.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const MockInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();

  const { plan, isPaid, updatePlan, refreshUsage, getQuotaFor } = useUsageQuota();
  const quota = getQuotaFor('interviewsGenerated');

  const [form, setForm] = useState({
    jobRole: '',
    jobDescription: '',
    experienceLevel: 'fresher',
    techStack: '',
    interviewType: 'technical',
    difficulty: 'medium',
    numberOfQuestions: 5,
  });

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await interviewService.getAll();
      setInterviews(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleOpenCreateModal = () => {
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quota reached (5/5 interviews). Upgrade for unmetered sessions.');
      setUpgradeModalOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quota reached (5/5 interviews). Upgrade for unmetered sessions.');
      setUpgradeModalOpen(true);
      return;
    }
    if (!form.jobRole.trim()) {
      return toast.error('Please enter a job role');
    }
    if (!form.jobDescription.trim()) {
      return toast.error('Please provide job details or description');
    }

    setSubmitting(true);
    try {
      const res = await interviewService.create(form);
      toast.success('Interview questions generated successfully');
      setOpenDialog(false);
      refreshUsage();
      navigate(`/dashboard/mocks/${res.data._id}`);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to generate interview questions';
      toast.error(errMsg);
      if (err.response?.status === 429 || errMsg.includes('limit reached')) {
        setUpgradeModalOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) return;
    try {
      await interviewService.delete(id);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      toast.success('Interview deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete interview');
    }
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return (
        <Badge variant="amber" size="sm">
          Pending
        </Badge>
      );
    }
    if (score >= 8) {
      return (
        <Badge variant="emerald" size="sm" dot>
          {score}/10 High
        </Badge>
      );
    }
    if (score >= 6) {
      return (
        <Badge variant="sky" size="sm" dot>
          {score}/10 Competent
        </Badge>
      );
    }
    return (
      <Badge variant="rose" size="sm" dot>
        {score}/10 Needs Review
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/8">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <Badge variant="slate" size="sm" dot>
              Simulations
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Technical Interview Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Practice scenario-based questions with voice capture and structured STAR rubric grading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {quota.isUnlimited ? (
            <Badge variant="sky" size="sm" dot>
              Professional Plan
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant={quota.isExceeded ? 'rose' : 'slate'}
                size="sm"
                dot={quota.isExceeded}
              >
                {quota.current}/5 sessions used
              </Badge>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => setUpgradeModalOpen(true)}
                icon={Zap}
              >
                Upgrade
              </Button>
            </div>
          )}

          <Button
            onClick={handleOpenCreateModal}
            variant="primary"
            size="md"
            icon={Plus}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Quota Exceeded Alert Banner */}
      {!quota.isUnlimited && quota.isExceeded && (
        <div className="rounded-xl border border-rose-500/30 bg-[#161218] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Free Quota Exhausted (5 of 5 Used)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                You have reached the free tier limit. Upgrade to Professional for unmetered interview sessions.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            icon={Zap}
            className="w-full sm:w-auto shrink-0"
          >
            Upgrade Plan
          </Button>
        </div>
      )}

      {/* New Interview Action Banner */}
      <div
        onClick={handleOpenCreateModal}
        className="rounded-xl p-5 border border-dashed border-white/15 hover:border-white/30 bg-[#12151e] cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#181c28] border border-white/10 flex items-center justify-center text-sky-400 shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Configure a tailored simulation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify your target seniority, role, and tech stack to generate scenario-based questions.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" icon={Plus}>
          Configure session
        </Button>
      </div>

      {/* Interview History List */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            Session History
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {interviews.length} {interviews.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl p-5 border border-white/8 bg-[#12151e] h-44 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-[#181c28] rounded w-2/3" />
                  <div className="h-3 bg-[#181c28] rounded w-1/2" />
                </div>
                <div className="h-8 bg-[#181c28] rounded w-full" />
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No Interviews Created Yet"
            description="Create your first mock interview to practice answering questions with audio and camera feedback."
            actionLabel="Generate Interview"
            onAction={() => setOpenDialog(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((item) => (
              <div
                key={item._id}
                className="rounded-xl p-5 bg-[#12151e] border border-white/8 hover:border-white/20 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {item.interviewType || 'Technical'}
                    </span>
                    {getScoreBadge(item.overallScore)}
                  </div>

                  <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">
                    {item.jobRole}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {item.jobDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <Badge variant="slate" size="sm">
                      {item.experienceLevel}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.questions?.length || 5} questions
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 ml-auto">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/8">
                  <Button
                    onClick={() => navigate(`/dashboard/mocks/${item._id}`)}
                    variant={item.status === 'completed' ? 'secondary' : 'primary'}
                    size="sm"
                    className="flex-1 justify-center"
                    icon={item.status === 'completed' ? FileCheck : Play}
                  >
                    {item.status === 'completed' ? 'Review telemetry' : 'Resume interview'}
                  </Button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <Modal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title="Configure New Mock Interview"
        description="Generates context-specific scenario questions based on your target role."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {/* Plan Quota Notice */}
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              quota.isUnlimited
                ? 'bg-[#141824] border-sky-500/20 text-slate-300'
                : quota.isExceeded
                ? 'bg-[#181216] border-rose-500/30 text-rose-300'
                : 'bg-[#12151e] border-white/8 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              Session Quota:
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span>
                {quota.isUnlimited
                  ? 'Professional (Unmetered)'
                  : `${quota.remaining} of 5 free sessions remaining`}
              </span>
              {!quota.isUnlimited && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenDialog(false);
                    setUpgradeModalOpen(true);
                  }}
                  className="text-xs text-white hover:underline cursor-pointer ml-1"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Target Job Role *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer (Node/Distributed Systems)"
              value={form.jobRole}
              onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Job Description / Focus Topics *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Paste job description requirements, architectural focus areas, or tech priorities..."
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Tech Stack
              </label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Kafka, Postgres"
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white outline-none transition-colors"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp.value} value={exp.value} className="bg-[#12151e] text-white">
                    {exp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Evaluation Format
              </label>
              <select
                value={form.interviewType}
                onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
                className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white outline-none transition-colors"
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#12151e] text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white outline-none transition-colors"
              >
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d.value} value={d.value} className="bg-[#12151e] text-white">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Question Count
              </label>
              <select
                value={form.numberOfQuestions}
                onChange={(e) =>
                  setForm({ ...form, numberOfQuestions: Number(e.target.value) })
                }
                className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white outline-none transition-colors"
              >
                {QUESTION_COUNTS.map((cnt) => (
                  <option key={cnt} value={cnt} className="bg-[#12151e] text-white">
                    {cnt} Questions
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-white/8">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              loading={submitting}
            >
              Generate Questions
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={() => refreshUsage()}
        updatePlan={updatePlan}
      />
    </div>
  );
};

export default MockInterviewsPage;

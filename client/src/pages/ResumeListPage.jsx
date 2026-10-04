import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Trash2,
  Calendar,
  Sparkles,
  Layers,
  AlertCircle,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import resumeService from '../services/resume.service.js';
import useUsageQuota from '../hooks/useUsageQuota.js';
import UpgradeModal from '../components/pricing/UpgradeModal.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const ResumeListPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();

  const { quota: rawQuota, updatePlan, refreshUsage, getQuotaFor } = useUsageQuota();
  const quota = getQuotaFor('resumesCreated');

  const [form, setForm] = useState({
    title: '',
    targetRole: '',
  });

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await resumeService.getAll();
      setResumes(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleOpenCreateModal = () => {
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan limit reached. Upgrade to Paid for unlimited resumes.');
      setUpgradeModalOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan limit reached. Upgrade to Paid for unlimited resumes.');
      setUpgradeModalOpen(true);
      return;
    }
    if (!form.title.trim()) {
      return toast.error('Please enter a title');
    }

    setSubmitting(true);
    try {
      const res = await resumeService.create(form);
      toast.success('Resume draft created!');
      setOpenDialog(false);
      refreshUsage();
      navigate(`/dashboard/resumes/${res.data._id}`);
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to create resume';
      toast.error(errMsg);
      if (err.response?.status === 429 || errMsg.includes('limit reached')) {
        setUpgradeModalOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeService.delete(id);
      setResumes((prev) => prev.filter((i) => i._id !== id));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete resume');
    }
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return (
        <Badge variant="amber" size="sm">
          Unscored
        </Badge>
      );
    }
    if (score >= 80) {
      return (
        <Badge variant="emerald" size="sm" dot>
          {score}% ATS Optimized
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="indigo" size="sm" dot>
          {score}% Average
        </Badge>
      );
    }
    return (
      <Badge variant="rose" size="sm" dot>
        {score}% Needs Work
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            ATS Resume Builder
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build ATS-compliant resumes with real-time scoring and AI bullet rewriting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {quota.isUnlimited ? (
            <Badge variant="indigo" size="md" dot>
              <Sparkles className="h-3 w-3 mr-1 inline text-yellow-300" />
              Unlimited Pro Tier
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <Badge
                variant={quota.isExceeded ? 'rose' : 'amber'}
                size="md"
                dot={quota.isExceeded}
              >
                {quota.current} / 3 Free Resumes
              </Badge>
              <Button
                size="xs"
                variant="primary"
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
            New Resume
          </Button>
        </div>
      </div>

      {/* Quota Exceeded Alert Banner */}
      {!quota.isUnlimited && quota.isExceeded && (
        <div className="glass-panel border-2 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-950/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-heading">
                Free Plan Limit Reached (3 of 3 Used)
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                You've built all 3 free resumes. Upgrade to Unlimited Pro to create more tailored resumes.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            icon={Sparkles}
            className="w-full sm:w-auto shrink-0"
          >
            Unlock Unlimited Access
          </Button>
        </div>
      )}

      {/* New Resume Action Banner */}
      <div
        onClick={handleOpenCreateModal}
        className="glass-panel-interactive border-dashed border-emerald-500/30 rounded-2xl p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Ready to stand out?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Create a tailored, ATS-friendly resume optimized for your next big role.
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" icon={Plus}>
          Build Resume
        </Button>
      </div>

      {/* Resume History List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            Your Resumes
          </h2>
          <span className="text-xs text-slate-400">
            {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-panel rounded-2xl p-6 h-40 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 bg-slate-800 rounded w-2/3" />
                  <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                </div>
                <div className="h-8 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Resumes Built Yet"
            description="Create your first ATS-optimized resume to start applying for roles."
            actionLabel="Build Resume"
            onAction={() => setOpenDialog(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((item) => (
              <div
                key={item._id}
                className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                      {item.status === 'scored' ? 'Scored' : 'Draft'}
                    </span>
                    {getScoreBadge(item.atsScore?.overall)}
                  </div>

                  <h3 className="text-lg font-bold text-white font-heading line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-4">
                    {item.targetRole || 'No target role specified'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-5">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <Button
                    onClick={() => navigate(`/dashboard/resumes/${item._id}`)}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    icon={FileText}
                  >
                    Edit Resume
                  </Button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Delete resume"
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
        title="Start a New Resume"
        description="Provide a title and a target role to get started."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Resume Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer - Tech Corp"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Job Role (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. React Developer"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used by our AI to optimize your ATS score and keyword suggestions.
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
              icon={Sparkles}
            >
              Create Resume
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

export default ResumeListPage;

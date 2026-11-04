import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Trash2,
  Calendar,
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
      toast.error('Free plan quota reached. Upgrade for unlimited resumes.');
      setUpgradeModalOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!quota.isUnlimited && quota.isExceeded) {
      toast.error('Free plan quota reached. Upgrade for unlimited resumes.');
      setUpgradeModalOpen(true);
      return;
    }
    if (!form.title.trim()) {
      return toast.error('Please enter a title');
    }

    setSubmitting(true);
    try {
      const res = await resumeService.create(form);
      toast.success('Resume draft created');
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
          {score}% ATS
        </Badge>
      );
    }
    if (score >= 60) {
      return (
        <Badge variant="slate" size="sm" dot>
          {score}% Average
        </Badge>
      );
    }
    return (
      <Badge variant="rose" size="sm" dot>
        {score}% Incomplete
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
              ATS Optimization
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            ATS Resume Compiler
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build ATS-compliant resumes with real-time heuristic scoring and STAR impact bullet rewriting.
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
                {quota.current}/3 resumes used
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
            New Resume
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
                Free Quota Exhausted (3 of 3 Used)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                You have reached your free tier resume limit. Upgrade to Professional for unlimited resumes.
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

      {/* New Resume Action Banner */}
      <div
        onClick={handleOpenCreateModal}
        className="rounded-xl p-5 border border-dashed border-white/15 hover:border-white/30 bg-[#12151e] cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#181c28] border border-white/10 flex items-center justify-center text-sky-400 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Create an ATS-targeted resume
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft or import sections to benchmark against automated applicant tracking parsers.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" icon={Plus}>
          Create draft
        </Button>
      </div>

      {/* Resume History List */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            Saved Resumes
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {resumes.length} {resumes.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl p-5 border border-white/8 bg-[#12151e] h-36 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-[#181c28] rounded w-2/3" />
                  <div className="h-3 bg-[#181c28] rounded w-1/2" />
                </div>
                <div className="h-8 bg-[#181c28] rounded w-full" />
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Resumes Built Yet"
            description="Create your first ATS-optimized resume to benchmark keywords and export PDF."
            actionLabel="Build Resume"
            onAction={() => setOpenDialog(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((item) => (
              <div
                key={item._id}
                className="rounded-xl p-5 bg-[#12151e] border border-white/8 hover:border-white/20 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {item.status === 'scored' ? 'Scored' : 'Draft'}
                    </span>
                    {getScoreBadge(item.atsScore?.overall)}
                  </div>

                  <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                    {item.targetRole || 'General Engineering'}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/8">
                  <Button
                    onClick={() => navigate(`/dashboard/resumes/${item._id}`)}
                    variant="primary"
                    size="sm"
                    className="flex-1 justify-center"
                    icon={FileText}
                  >
                    Edit resume
                  </Button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
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
        description="Provide a document title and target role to configure the ATS analyzer."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Resume Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer (Core Systems)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Target Job Role <span className="text-slate-500 lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. React / TypeScript Lead"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="w-full bg-[#12151e] border border-white/10 focus:border-white/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used to calibrate ATS keyword extraction and bullet rubrics.
            </p>
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
              icon={Plus}
            >
              Create Document
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

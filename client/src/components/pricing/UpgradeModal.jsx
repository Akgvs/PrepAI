import { useState } from 'react';
import { Sparkles, Check, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

const UpgradeModal = ({ isOpen, onClose, onUpgradeSuccess, updatePlan }) => {
  const [loading, setLoading] = useState(false);

  const perks = [
    'Unlimited AI Mock Interviews (Zero rate limits)',
    'Priority Google Gemini 2.0 Flash speed',
    'Up to 10 questions per customized interview',
    'Comprehensive STAR method gap analysis & exemplar answers',
    'Full audio speech playback & real-time mic evaluation',
    'Priority support & upcoming features',
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      if (updatePlan) {
        await updatePlan('paid');
      }
      toast.success('Congratulations! You now have unlimited AI mock interviews!');
      if (onUpgradeSuccess) onUpgradeSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="text-center pt-2 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/30 mb-4 animate-bounce">
          <Sparkles className="h-7 w-7 text-yellow-300" />
        </div>

        <Badge variant="indigo" size="md" dot className="mb-2">
          Unlimited Career Advancement
        </Badge>

        <h2 className="text-2xl font-black font-heading text-white mb-2">
          Unlock Unlimited AI Mock Interviews
        </h2>

        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          Upgrade to the Paid tier to practice as many role-tailored technical & behavioral interviews as you need.
        </p>

        {/* Pricing Pill */}
        <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs text-slate-400 block font-medium">Unlimited Pro Tier</span>
            <span className="text-xl font-bold font-heading text-white flex items-center gap-1">
              $19 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </span>
          </div>
          <Badge variant="emerald" size="sm">
            <Zap className="h-3 w-3 mr-1 inline" /> Instant Activation
          </Badge>
        </div>

        {/* Perk list */}
        <div className="text-left space-y-2.5 mb-6">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-2.5 w-2.5" />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onClose}
            disabled={loading}
          >
            Maybe Later
          </Button>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleUpgrade}
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Confirm & Activate
          </Button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          Instant activation • Cancel anytime • 100% satisfaction guarantee
        </p>
      </div>
    </Modal>
  );
};

export default UpgradeModal;

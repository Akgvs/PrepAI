import { useState } from 'react';
import { PRICING_TIERS } from '../../utils/constants.js';
import PricingCard from './PricingCard.jsx';
import UpgradeModal from './UpgradeModal.jsx';
import useUsageQuota from '../../hooks/useUsageQuota.js';
import { Sparkles, Shield, Zap, RefreshCw } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import toast from 'react-hot-toast';

const PricingSection = ({ showTitle = true, className = '' }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [switchingToFree, setSwitchingToFree] = useState(false);
  const { plan, updatePlan, refreshUsage } = useUsageQuota();

  const handleSelectTier = async (tierId) => {
    if (tierId === plan) return;

    if (tierId === 'paid') {
      setUpgradeModalOpen(true);
    } else if (tierId === 'free') {
      // Downgrading/switching back to free
      setSwitchingToFree(true);
      try {
        await updatePlan('free');
        toast.success('Switched back to Free Starter tier.');
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to switch plan');
      } finally {
        setSwitchingToFree(false);
      }
    }
  };

  return (
    <section id="pricing" className={`relative z-10 py-16 ${className}`}>
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="indigo" size="md" dot className="mb-3">
            <Sparkles className="h-3 w-3 mr-1 inline text-indigo-400" />
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight mb-4">
            Invest in Your Dream Career
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Start with 5 free AI mock interviews to build your foundation, or unlock unlimited
            practice sessions with our Pro tier.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-inner">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                !isYearly
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isYearly
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Two Tier Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {PRICING_TIERS.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            isYearly={isYearly}
            currentPlan={plan}
            onSelectTier={handleSelectTier}
            isLoading={tier.id === 'free' && switchingToFree}
          />
        ))}
      </div>

      {/* Trust & Guarantees */}
      <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white font-heading">Instant Setup</h4>
          <p className="text-xs text-slate-400 mt-1">Start practicing right after selecting your plan.</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <Shield className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white font-heading">Zero Hidden Fees</h4>
          <p className="text-xs text-slate-400 mt-1">Free means truly free for 5 full mock interviews.</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
            <RefreshCw className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-white font-heading">Switch Anytime</h4>
          <p className="text-xs text-slate-400 mt-1">Upgrade or cancel with seamless 1-click controls.</p>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgradeSuccess={() => refreshUsage()}
        updatePlan={updatePlan}
      />
    </section>
  );
};

export default PricingSection;

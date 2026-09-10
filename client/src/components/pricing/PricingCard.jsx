import { Check, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

const PricingCard = ({
  tier,
  isYearly,
  currentPlan,
  onSelectTier,
  isLoading,
}) => {
  const price = isYearly ? tier.priceYearly : tier.priceMonthly;
  const isCurrent = currentPlan === tier.id;
  const isPaidTier = tier.id === 'paid';

  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
        isPaidTier
          ? 'glass-panel border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/20 hover:border-indigo-400 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950/80'
          : 'glass-panel border border-white/10 hover:border-white/20'
      }`}
    >
      {/* Luminous Glow for Paid Tier */}
      {isPaidTier && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge
            variant="indigo"
            size="md"
            dot
            className="shadow-lg shadow-indigo-500/40 px-3 py-1 font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400/40 text-white"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 inline text-yellow-300" />
            {tier.badge}
          </Badge>
        </div>
      )}

      <div>
        {/* Tier Header */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <div>
            <h3 className="text-2xl font-bold font-heading text-white">
              {tier.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {tier.tagline}
            </p>
          </div>
          {!isPaidTier && (
            <Badge variant={tier.badgeVariant} size="sm">
              {tier.badge}
            </Badge>
          )}
        </div>

        {/* Price Display */}
        <div className="my-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black font-heading text-white tracking-tight">
              ${price}
            </span>
            <span className="text-sm font-medium text-slate-400">
              {tier.id === 'free' ? '/ forever' : isYearly ? '/ month (billed yearly)' : '/ month'}
            </span>
          </div>
          {isYearly && isPaidTier && (
            <p className="text-xs text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
              <Zap className="h-3 w-3 inline" /> Save $48/year with annual billing
            </p>
          )}
        </div>

        {/* Quota Feature Banner */}
        <div
          className={`rounded-2xl p-4 mb-6 border ${
            isPaidTier
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
              : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-5 w-5 ${isPaidTier ? 'text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider block text-slate-400">
                Mock Interview Quota
              </span>
              <span className="text-base font-extrabold font-heading text-white">
                {tier.interviewQuota}
              </span>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Included Capabilities
          </span>
          {tier.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    feature.highlight
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="h-3 w-3" />
                </div>
              )}
              <span
                className={
                  feature.included
                    ? feature.highlight
                      ? 'text-white font-semibold'
                      : 'text-slate-300'
                    : 'text-slate-500 line-through'
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <Button
          onClick={() => onSelectTier(tier.id)}
          variant={isCurrent ? 'secondary' : isPaidTier ? 'primary' : 'secondary'}
          size="lg"
          disabled={isCurrent || isLoading}
          loading={isLoading}
          className={`w-full justify-center ${
            isCurrent ? 'opacity-80 cursor-default ring-1 ring-white/20' : ''
          }`}
        >
          {isCurrent
            ? 'Current Active Plan'
            : isPaidTier
            ? 'Upgrade to Unlimited'
            : 'Select Free Plan'}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;

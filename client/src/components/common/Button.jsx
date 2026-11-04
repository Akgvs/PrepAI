import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-white hover:bg-slate-100 text-slate-950 font-semibold border border-white/20 shadow-sm active:scale-[0.98] transition-colors',
  gradient:
    'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 active:scale-[0.98]',
  secondary:
    'bg-[#161a24] hover:bg-[#1e2330] text-slate-200 border border-white/10 active:scale-[0.98] transition-colors',

  outline:
    'bg-transparent hover:bg-white/5 text-slate-200 border border-white/15 hover:border-white/30 active:scale-[0.98] transition-colors',
  ghost:
    'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-colors',
  danger:
    'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 active:scale-[0.98] transition-colors',
  success:
    'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 active:scale-[0.98] transition-colors',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-xs font-medium rounded-lg gap-2',
  lg: 'px-4.5 py-2.5 text-sm font-semibold rounded-lg gap-2',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin h-3.5 w-3.5" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>{children}</span>
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

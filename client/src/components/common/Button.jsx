import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 active:scale-[0.98]',
  secondary:
    'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-white/5 text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/60 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/60 active:scale-[0.98]',
  success:
    'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-medium rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
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
        className={`inline-flex items-center justify-center transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className="h-4 w-4 shrink-0" />
        )}
        <span>{children}</span>
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="h-4 w-4 shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

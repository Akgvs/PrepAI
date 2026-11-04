const variants = {
  indigo: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  purple: 'bg-slate-800/80 text-slate-300 border-white/10',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  slate: 'bg-[#181c28] text-slate-300 border-white/10',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px] font-medium tracking-tight',
  md: 'px-2.5 py-1 text-xs font-medium tracking-tight',
};

const Badge = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  dot = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variants[variant] || variants.slate} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-80" />
      )}
      {children}
    </span>
  );
};

export default Badge;

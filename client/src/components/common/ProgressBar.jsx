const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  sublabel,
  color = 'white',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const solidColors = {
    white: 'bg-white',
    sky: 'bg-sky-400',
    indigo: 'bg-sky-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs mb-1.5 text-slate-300">
          {label && <span className="font-medium text-slate-200">{label}</span>}
          {sublabel ? (
            <span className="text-slate-400 font-mono">{sublabel}</span>
          ) : (
            <span className="text-slate-400 font-mono tabular-nums">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full h-1.5 bg-[#161a24] rounded-full overflow-hidden border border-white/8">
        <div
          className={`h-full ${solidColors[color] || solidColors.white} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

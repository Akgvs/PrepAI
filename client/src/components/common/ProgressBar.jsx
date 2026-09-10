const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  sublabel,
  color = 'indigo',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const gradients = {
    indigo: 'from-indigo-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs mb-1.5 text-slate-300">
          {label && <span className="font-medium">{label}</span>}
          {sublabel ? (
            <span className="text-slate-400">{sublabel}</span>
          ) : (
            <span className="text-slate-400 font-mono">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className={`h-full bg-gradient-to-r ${gradients[color] || gradients.indigo} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

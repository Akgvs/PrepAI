import Button from './Button.jsx';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`glass-panel border-dashed border-slate-700/80 rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h4 className="text-lg font-bold text-white font-heading mb-1.5">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

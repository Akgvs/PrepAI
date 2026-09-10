const Card = ({
  children,
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 ${
        interactive ? 'glass-panel-interactive cursor-pointer' : 'glass-panel'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

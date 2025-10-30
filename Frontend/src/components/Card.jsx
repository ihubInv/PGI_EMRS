const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-card glass-hover rounded-2xl relative ${className}`}
      style={{ zIndex: 'auto' }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-4 overflow-visible" style={{ zIndex: 'auto' }}>{children}</div>
    </div>
  );
};

export default Card;


import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) => {
  const base = 'rounded-2xl transition-all duration-200';
  const glassStyle = glass
    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm'
    : 'bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-sm';
  const hoverStyle = hoverEffect ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : '';

  return (
    <div className={`${base} ${glassStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

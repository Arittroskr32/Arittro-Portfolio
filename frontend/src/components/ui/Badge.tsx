import React from 'react';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'accent';
  className?: string;
}
export function Badge({
  children,
  variant = 'default',
  className = ''
}: BadgeProps) {
  const variants = {
    default: 'bg-navy-700 text-slate-300',
    outline: 'border border-navy-600 text-slate-400 bg-transparent',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    accent: 'bg-electric-500/10 text-electric-400 border border-electric-500/20'
  };
  return <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>;
}
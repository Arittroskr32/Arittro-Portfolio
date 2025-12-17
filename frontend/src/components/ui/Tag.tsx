import React from 'react';
interface TagProps {
  children: React.ReactNode;
  className?: string;
}
export function Tag({
  children,
  className = ''
}: TagProps) {
  return <span className={`
      inline-flex items-center px-2 py-1 rounded-md text-xs font-mono
      bg-navy-900 text-electric-400 border border-navy-700
      ${className}
    `}>
      {children}
    </span>;
}
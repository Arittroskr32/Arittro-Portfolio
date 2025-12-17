import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">
          {label}
        </label>}
      <input className={`
          w-full px-4 py-2.5 rounded-lg bg-navy-900/50 border 
          text-warm-50 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-navy-700'}
          ${className}
        `} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>;
}
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  withArrow?: boolean;
}
export function Button({
  children,
  variant = 'primary',
  withArrow = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-electric-500 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-electric-500 text-white hover:bg-electric-600 shadow-lg shadow-electric-500/20',
    secondary: 'bg-white text-navy-900 hover:bg-warm-100',
    outline: 'border border-slate-700 text-warm-50 hover:border-electric-500 hover:text-electric-500 bg-transparent'
  };
  return <motion.button whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
      {withArrow && <ArrowRight className="ml-2 h-4 w-4" />}
    </motion.button>;
}
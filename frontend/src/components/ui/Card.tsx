import React from 'react';
import { motion } from 'framer-motion';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  noPadding?: boolean;
}
export function Card({
  children,
  className = '',
  hover = false,
  noPadding = false,
  ...props
}: CardProps) {
  return <motion.div whileHover={hover ? {
    y: -4,
    boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.1)'
  } : undefined} transition={{
    duration: 0.2
  }} className={`
        bg-navy-800/50 backdrop-blur-sm border border-navy-700 
        rounded-xl overflow-hidden
        ${noPadding ? '' : 'p-6'}
        ${className}
      `} {...props}>
      {children}
    </motion.div>;
}
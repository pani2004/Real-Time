import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = variant === 'glass' 
    ? 'bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/40 shadow-2xl shadow-purple-500/20'
    : 'bg-slate-900 shadow-2xl border-2 border-purple-500/30';
    
  return (
    <div className={`rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.01] ${variantStyles} ${className}`}>
      {children}
    </div>
  );
};

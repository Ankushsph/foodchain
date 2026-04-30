import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const GlassCard = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "glass-panel rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] group h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

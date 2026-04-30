import React from 'react';
import { cn } from './GlassCard';

const variantStyles = {
  safe: "bg-green-500/10 text-[#39ff14] border-[#39ff14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]",
  unsafe: "bg-red-500/10 text-[#ff073a] border-[#ff073a]/50 shadow-[0_0_10px_rgba(255,7,58,0.2)]",
  warning: "bg-yellow-500/10 text-[#fffb00] border-[#fffb00]/50 shadow-[0_0_10px_rgba(255,251,0,0.2)]",
  verified: "bg-blue-500/10 text-[#00f3ff] border-[#00f3ff]/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]",
  default: "bg-gray-500/10 text-gray-300 border-gray-500/50"
};

export const Badge = ({ children, variant = 'default', className, ...props }) => {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

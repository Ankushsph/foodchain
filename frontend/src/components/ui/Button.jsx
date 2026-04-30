import React from 'react';
import { cn } from './GlassCard';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 focus:ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500 border border-gray-700",
    outline: "bg-transparent text-white border border-gray-600 hover:bg-gray-800 focus:ring-gray-500",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/10 focus:ring-gray-500",
    neonBlue: "bg-blue-500/10 text-[#00f3ff] border border-[#00f3ff]/50 hover:bg-[#00f3ff]/20 focus:ring-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

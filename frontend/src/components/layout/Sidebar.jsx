import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Link as LinkIcon, AlertTriangle, BarChart3, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { cn } from '../ui/GlassCard';

const navLinks = [
  { name: 'Dashboard', path: '/', icon: Activity },
  { name: 'Supply Chain', path: '/supply-chain', icon: LinkIcon },
  { name: 'Scan QR', path: '/scan', icon: ShieldCheck },
  { name: 'Blockchain Audit', path: '/alerts', icon: History },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="fixed left-0 top-0 h-screen bg-panel-bg backdrop-blur-xl border-r border-white/10 z-50 flex flex-col transition-all duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 relative group cursor-pointer">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <ShieldCheck className="w-8 h-8 text-[#00cfff] flex-shrink-0 drop-shadow-[0_0_10px_rgba(0,207,255,0.8)]" />
          <motion.span 
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00cfff] to-[#7a5cff]"
          >
            FoodChain AI
          </motion.span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Hover/Active Glow Effect Background */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#00cfff]/20 to-transparent opacity-50"
                  />
                )}
                
                {/* Active Left Border */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00cfff] rounded-r-md shadow-[0_0_10px_#00cfff]" />
                )}

                <link.icon className={cn(
                  "w-6 h-6 flex-shrink-0 transition-all duration-300", 
                  isActive ? "text-[#00cfff] drop-shadow-[0_0_8px_rgba(0,207,255,0.5)]" : "group-hover:text-[#00cfff]"
                )} />
                
                <motion.span 
                  initial={false}
                  animate={{ opacity: isCollapsed ? 0 : 1, display: isCollapsed ? 'none' : 'block' }}
                  className="font-medium whitespace-nowrap"
                >
                  {link.name}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/5 flex justify-center">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center w-full"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.div>
  );
};

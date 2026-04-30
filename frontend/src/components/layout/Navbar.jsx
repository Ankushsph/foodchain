import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShieldCheck, Activity, Link as LinkIcon, AlertTriangle, BarChart3, Wallet } from 'lucide-react';
import { cn } from '../ui/GlassCard';
import useStore from '../../store/useStore';
import { Button } from '../ui/Button';

const navLinks = [
  { name: 'Dashboard', path: '/', icon: Activity },
  { name: 'Supply Chain', path: '/supply-chain', icon: LinkIcon },
  { name: 'Scan QR', path: '/scan', icon: ShieldCheck },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const blockchainStatus = useStore((state) => state.blockchain.isConnected);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#00f3ff]" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f3ff] to-[#39ff14]">
              FoodChain AI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                    isActive
                      ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                {blockchainStatus && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f3ff] opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-3 w-3", blockchainStatus ? "bg-[#00f3ff]" : "bg-gray-500")}></span>
              </span>
              <span className={blockchainStatus ? "text-[#00f3ff]" : "text-gray-400"}>
                {blockchainStatus ? "Stellar Connected" : "Disconnected"}
              </span>
            </div>
            
            <Button variant="neonBlue" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#39ff14] to-[#00f3ff] p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-xs font-bold text-white">US</span>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden glass-panel border-t border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            ))}
            
            <div className="mt-4 pt-4 border-t border-white/10 px-3">
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className={cn("inline-flex rounded-full h-3 w-3", blockchainStatus ? "bg-[#00f3ff]" : "bg-gray-500")}></span>
                <span className={blockchainStatus ? "text-[#00f3ff]" : "text-gray-400"}>
                  {blockchainStatus ? "Stellar Connected" : "Disconnected"}
                </span>
              </div>
              <Button variant="neonBlue" className="w-full justify-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Wallet, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../ui/GlassCard';
import useStore from '../../store/useStore';

export const Topbar = () => {
  const location = useLocation();
  const blockchainStatus = useStore((state) => state.blockchain.isConnected);

  // Map path to title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/supply-chain': return 'Supply Chain Pipeline';
      case '/scan': return 'Food Safety Scanner';
      case '/alerts': return 'System Alerts';
      case '/analytics': return 'Analytics & Reports';
      default: return 'Control Panel';
    }
  };

  return (
    <header className="h-20 w-full bg-panel-bg backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 flex items-center justify-between px-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Blockchain Status */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <div className="relative flex h-3 w-3">
            {blockchainStatus && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cfff] opacity-75"></span>
            )}
            <span className={cn("relative inline-flex rounded-full h-3 w-3", blockchainStatus ? "bg-[#00cfff] shadow-[0_0_8px_#00cfff]" : "bg-gray-500")}></span>
          </div>
          <span className={cn("text-sm font-medium", blockchainStatus ? "text-[#00cfff]" : "text-gray-400")}>
            {blockchainStatus ? "Stellar Connected" : "Disconnected"}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff3b3b] rounded-full border border-black shadow-[0_0_8px_#ff3b3b]"></span>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00ff9f] to-[#00cfff] p-[2px] shadow-[0_0_15px_rgba(0,207,255,0.4)]">
          <div className="w-full h-full rounded-full bg-[#030014] flex items-center justify-center">
            <span className="text-sm font-bold text-white tracking-widest">FN</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../ui/GlassCard';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-[#00cfff]/30 selection:text-white relative overflow-hidden">
      {/* Global Background Effects - Deep Workspace Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00cfff]/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#7a5cff]/5 blur-[150px]" />
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-[#00ff9f]/5 blur-[150px] -translate-x-1/2" />
      </div>

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 relative",
          isSidebarCollapsed ? "ml-[80px]" : "ml-[260px]"
        )}>
          <Topbar />
          
          {/* Centered Main Content Container */}
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8 md:px-8 lg:px-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

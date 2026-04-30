import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Hash, ShieldAlert, BrainCircuit, Activity, Link as LinkIcon, ExternalLink, CheckCircle2, Copy, Check, ShieldCheck } from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Enhanced demo alerts tailored to the exact specifications
const demoAlerts = [
  {
    id: 1,
    batchId: 'BATCH-4829A',
    severity: 'CRITICAL',
    status: 'active',
    reason: 'High turbidity detected (4.5 NTU) & low pH (5.8)',
    source: 'Distributor A',
    aiInsight: 'Detected by AI anomaly system during transit',
    actionTaken: 'Batch automatically quarantined. Transit halted.',
    timestamp: new Date().toISOString(),
    txHash: '0x3a9b1c8f4d7e2f5a9b8c7d6e5f4a3b2c1d0e9f8a',
  },
  {
    id: 2,
    batchId: 'BATCH-4825B',
    severity: 'WARNING',
    status: 'active',
    reason: 'Temperature spike (+2.1°C) above threshold',
    source: 'ColdChain Logistics',
    aiInsight: 'Predicted spoilage risk within 48 hours',
    actionTaken: 'Alert sent to logistics driver for AC review',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    txHash: '0x9b8c7d6e5f4a3b2c1d0e9f8a3a9b1c8f4d7e2f5a',
  },
  {
    id: 3,
    batchId: 'BATCH-4811X',
    severity: 'CRITICAL',
    status: 'resolved',
    reason: 'E. coli marker potential match',
    source: 'Farm Node C',
    aiInsight: 'Confirmed by bio-sensor network',
    actionTaken: 'Batch destroyed. Supplier flagged for audit.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    txHash: '0x1d0e9f8a3a9b1c8f4d7e2f5a9b8c7d6e5f4a3b2c',
  }
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
};

export const Alerts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAlerts = demoAlerts.filter(alert => {
    const matchesTab = alert.status === activeTab;
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    return matchesTab && matchesSeverity;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          System Alerts
        </h1>
        <p className="text-[#ff3b3b] mt-2 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-ping" />
          AI-detected food safety alerts across the supply chain
        </p>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel-bg p-2 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all",
              activeTab === 'active' 
                ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            Active Alerts
          </button>
          <button 
            onClick={() => setActiveTab('resolved')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all",
              activeTab === 'resolved' 
                ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/20" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            Resolved Alerts
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-500 font-mono uppercase tracking-widest mr-2">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border",
                filterSeverity === sev 
                  ? sev === 'CRITICAL' ? "bg-[#ff3b3b]/20 text-[#ff3b3b] border-[#ff3b3b]/40" 
                    : sev === 'WARNING' ? "bg-[#fffb00]/20 text-[#fffb00] border-[#fffb00]/40"
                    : "bg-[#00cfff]/20 text-[#00cfff] border-[#00cfff]/40"
                  : "bg-transparent text-gray-500 border-transparent hover:bg-white/5"
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 pt-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const shortHash = `${alert.txHash.substring(0, 8)}...${alert.txHash.substring(alert.txHash.length - 8)}`;
            
            return (
              <motion.div key={alert.id} variants={item} layout>
                <GlassCard className={cn(
                  "relative overflow-hidden group border-l-4 p-8",
                  isCritical ? "border-l-[#ff3b3b] border-t-white/5 border-r-white/5 border-b-white/5 shadow-[0_0_30px_rgba(255,59,59,0.08)]" :
                               "border-l-[#fffb00] border-t-white/5 border-r-white/5 border-b-white/5 shadow-[0_0_20px_rgba(255,251,0,0.05)]"
                )}>
                  
                  {/* Severity Background Glow */}
                  <div className={cn(
                    "absolute top-0 left-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20",
                    isCritical ? "bg-[#ff3b3b]" : "bg-[#fffb00]"
                  )} />
                  
                  <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                    
                    {/* Main Alert Info (Left) */}
                    <div className="flex-1 space-y-6">
                      
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full font-black text-sm tracking-widest flex items-center gap-2",
                          isCritical ? "bg-[#ff3b3b]/20 text-[#ff3b3b] border border-[#ff3b3b]/40 shadow-[0_0_15px_rgba(255,59,59,0.3)]" 
                                     : "bg-[#fffb00]/20 text-[#fffb00] border border-[#fffb00]/40 shadow-[0_0_15px_rgba(255,251,0,0.2)]"
                        )}>
                          {isCritical ? <ShieldAlert className="w-4 h-4 animate-pulse" /> : <AlertTriangle className="w-4 h-4" />}
                          {alert.severity}
                        </div>
                        
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                          <Hash className="w-4 h-4 text-gray-500" />
                          <span className="font-mono text-sm text-gray-300">{alert.batchId}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm ml-auto">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" /> Reason
                          </p>
                          <p className="text-white font-bold">{alert.reason}</p>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" /> Source
                          </p>
                          <p className="text-white font-bold">{alert.source}</p>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-[#00cfff]" /> AI Insight
                          </p>
                          <p className="text-[#00cfff] font-bold">{alert.aiInsight}</p>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#00ff9f]" /> Action Taken
                          </p>
                          <p className={cn(
                            "font-bold",
                            isCritical ? "text-[#ff3b3b]" : "text-[#fffb00]"
                          )}>
                            {alert.actionTaken}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Verification (Right) */}
                    <div className="lg:w-80 bg-panel-bg border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
                      <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                          <LinkIcon className="w-5 h-5 text-[#00cfff]" />
                          Blockchain Verification
                        </h4>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-[#00ff9f] font-medium bg-[#00ff9f]/5 p-2.5 rounded-lg border border-[#00ff9f]/20">
                            <CheckCircle2 className="w-5 h-5" />
                            Verified on Stellar Network
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 font-mono mb-1">Transaction Hash</p>
                            <div className="flex items-center justify-between font-mono text-xs text-[#00cfff] bg-black/40 p-2.5 rounded-lg border border-white/5">
                              {shortHash}
                              <button 
                                onClick={() => handleCopy(alert.txHash, alert.id)}
                                className="p-1 hover:text-white transition-colors"
                                title="Copy Hash"
                              >
                                {copiedId === alert.id ? <Check className="w-4 h-4 text-[#00ff9f]" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full text-sm py-1 h-10 border-[#00cfff]/30 text-[#00cfff] hover:bg-[#00cfff]/10 hover:border-[#00cfff]/50">
                        View on Explorer <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>

                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
          
          {filteredAlerts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 text-gray-500 bg-panel-bg rounded-2xl border border-white/5"
            >
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-mono uppercase tracking-widest text-gray-400">No Alerts Found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

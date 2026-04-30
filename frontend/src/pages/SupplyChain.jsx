import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Store, MapPin, AlertTriangle, ShieldCheck, Activity,
  Link as LinkIcon, ExternalLink, CheckCircle2, Copy, Check,
  BrainCircuit, Ban, Factory, Leaf
} from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import useStore, { STAGES } from '../store/useStore';

// Icon map per stage
const STAGE_ICONS = {
  farm: Leaf,
  distributor: Truck,
  retail: Store,
};

// Stage display names
const STAGE_LABELS = {
  farm: "Farm",
  distributor: "Distributor",
  retail: "Retail Store",
};

// Derive visual theme for each node
function getNodeTheme(status, isRootCause) {
  if (isRootCause || status === "unsafe") {
    return {
      glow: "rgba(255,59,59,0.7)",
      border: "border-[#ff3b3b]/50",
      text: "text-[#ff3b3b]",
      pill: "bg-[#ff3b3b]/10 border-[#ff3b3b]/30 text-[#ff3b3b]",
      label: isRootCause ? "ROOT CAUSE / UNSAFE" : "UNSAFE / COMPROMISED",
    };
  }
  if (status === "safe") {
    return {
      glow: "rgba(0,255,159,0.4)",
      border: "border-[#00ff9f]/30",
      text: "text-[#00ff9f]",
      pill: "bg-[#00ff9f]/10 border-[#00ff9f]/30 text-[#00ff9f]",
      label: "SAFE / SECURE",
    };
  }
  if (status === "blocked") {
    return {
      glow: "rgba(255,59,59,0.15)",
      border: "border-[#ff3b3b]/15",
      text: "text-gray-500",
      pill: "bg-black/40 border-white/5 text-gray-500",
      label: "BLOCKED",
    };
  }
  // pending
  return {
    glow: "rgba(255,255,255,0.08)",
    border: "border-white/5",
    text: "text-gray-500",
    pill: "bg-white/5 border-white/10 text-gray-500",
    label: "PENDING",
  };
}

export const SupplyChain = () => {
  const {
    supplyChain,
    aiResult,
    distributorInfo,
    blockchain,
    hasData,
    batchHistory,
    rootCause,
    rootCauseReason,
    decision,
    batchId,
    selectedStage,
  } = useStore();

  // Auto-jump active node to the most recently submitted stage
  const lastSubmittedStage = batchHistory.length > 0
    ? batchHistory[batchHistory.length - 1].stage
    : 'farm';
  const [activeNodeId, setActiveNodeId] = useState('farm');
  const [copied, setCopied] = useState(false);

  // Keep active node in sync with last submission
  React.useEffect(() => {
    if (lastSubmittedStage) setActiveNodeId(lastSubmittedStage);
  }, [lastSubmittedStage]);

  // Determine which stages are visible based on flow state
  // Rules: show all submitted stages + next pending stage (if flow not stopped)
  // If flow stopped at rootCause: show up to rootCause + blocked indicator for next
  const visibleNodes = useMemo(() => {
    const submitted = new Set(batchHistory.map(e => e.stage));
    const rcIdx = rootCause ? STAGES.indexOf(rootCause) : -1;

    return supplyChain.filter((node, idx) => {
      if (submitted.has(node.id)) return true; // always show submitted stages
      // If flow stopped, only show one blocked stage after rootCause
      if (decision && decision !== 'ALLOW' && rcIdx !== -1) {
        return idx === rcIdx + 1; // show exactly one blocked stage after root cause
      }
      // Show next pending stage only
      const firstPending = STAGES.find(s => !submitted.has(s));
      return node.id === firstPending;
    });
  }, [supplyChain, batchHistory, rootCause, decision]);

  const nodes = visibleNodes;

  const activeNode = useMemo(() =>
    nodes.find(n => n.id === activeNodeId) || nodes[0],
    [nodes, activeNodeId]
  );

  const handleCopy = () => {
    if (blockchain.txHash !== 'N/A') {
      navigator.clipboard.writeText(blockchain.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortHash = blockchain.txHash === 'N/A'
    ? 'N/A'
    : `${blockchain.txHash.substring(0, 8)}...${blockchain.txHash.substring(blockchain.txHash.length - 8)}`;

  const isChainSafe = decision === 'ALLOW' || decision === 'APPROVED_FOR_SALE' || (!hasData);

  // Flow progress: stop at root cause index if blocked
  const rootCauseIndex = rootCause ? STAGES.indexOf(rootCause) : -1;
  const flowStopIndex = (decision !== 'ALLOW' && decision !== 'APPROVED_FOR_SALE' && rootCauseIndex !== -1) ? rootCauseIndex : STAGES.length - 1;
  const flowWidthPct = hasData
    ? `${((flowStopIndex + 1) / STAGES.length) * 100}%`
    : '0%';

  // Decision style
  const decisionBadge = {
    ALLOW: "border-[#00ff9f]/40 text-[#00ff9f] bg-[#00ff9f]/10 shadow-[0_0_20px_rgba(0,255,159,0.2)]",
    STOP_SUPPLY: "border-[#ff3b3b]/40 text-[#ff3b3b] bg-[#ff3b3b]/10 shadow-[0_0_20px_rgba(255,59,59,0.2)] animate-pulse",
    BLOCK_BATCH: "border-[#ff3b3b]/40 text-[#ff3b3b] bg-[#ff3b3b]/10 shadow-[0_0_20px_rgba(255,59,59,0.2)] animate-pulse",
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 pb-12">

      {/* ── BATCH FLOW STATUS (HEADER) ── */}
      <AnimatePresence>
        {hasData && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
            <GlassCard className="w-full max-w-5xl border-white/10 bg-white/[0.02] p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                    isChainSafe ? "border-[#00ff9f]/30 bg-[#00ff9f]/10 text-[#00ff9f]" : "border-[#ff3b3b]/30 bg-[#ff3b3b]/10 text-[#ff3b3b]"
                  )}>
                    {isChainSafe ? <ShieldCheck className="w-6 h-6" /> : <Ban className="w-6 h-6 animate-pulse" />}
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Batch Flow Status</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-white italic tracking-tighter uppercase">Batch {batchId}</span>
                      <Badge variant={isChainSafe ? 'safe' : 'unsafe'} className={cn("px-3 py-0.5 text-[9px] font-black italic", !isChainSafe && "animate-pulse")}>
                        {decision === 'APPROVED_FOR_SALE' ? '✓ APPROVED FOR SALE' : isChainSafe ? '✓ PIPELINE SECURE' : '⚠ FLOW HALTED'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Root Cause</p>
                    <p className={cn("text-sm font-black italic uppercase", rootCause ? "text-[#ff3b3b]" : "text-[#00ff9f]")}>
                      {rootCause || 'None Detected'}
                    </p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-8">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Decision</p>
                    <p className={cn("text-sm font-black italic uppercase", isChainSafe ? "text-[#00ff9f]" : "text-[#ff3b3b]")}>
                      {decision?.replace('_', ' ') || 'Awaiting'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECTION 1: TOP ALERT ── */}
      <AnimatePresence>
        {!isChainSafe && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
            <div className="w-full max-w-5xl px-8 py-8 rounded-3xl bg-[#ff3b3b]/10 border-2 border-[#ff3b3b]/40 shadow-[0_0_50px_rgba(255,59,59,0.2)] text-center space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff3b3b] to-transparent animate-pulse" />
              <AlertTriangle className="w-12 h-12 text-[#ff3b3b] mx-auto mb-2 animate-bounce" />
              <h2 className="text-3xl font-black text-[#ff3b3b] uppercase tracking-tighter italic">
                🚨 Contamination detected at {rootCause?.toUpperCase()}
              </h2>
              <p className="text-white/80 text-base font-bold uppercase tracking-tight">
                {decision === "BLOCK_BATCH" 
                  ? "Batch blocked at source to prevent contamination spread" 
                  : decision === "STOP_SUPPLY"
                    ? "Logistics supply chain halted due to transport failure"
                    : "Batch rejected at retail checkpoint"}
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="px-4 py-2 rounded-xl bg-black/40 border border-[#ff3b3b]/20">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Blocked Stage</p>
                  <p className="text-xs font-black text-[#ff3b3b] uppercase">{rootCause}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-black/40 border border-[#ff3b3b]/20">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Downstream Impact</p>
                  <p className="text-xs font-black text-white uppercase italic">Retail Halted</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PIPELINE VISUALIZATION ── */}
      <div className="relative py-20 px-4 md:px-12 bg-white/[0.02] rounded-[3rem] border border-white/5 backdrop-blur-xl">
        
        {/* Connection Line */}
        <div className="absolute top-[35%] left-[12%] right-[12%] h-1.5 bg-white/5 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative bg-[#00ff9f] shadow-[0_0_20px_#00ff9f]"
            initial={{ width: 0 }}
            animate={{ width: hasData ? flowWidthPct : '0%' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {!isChainSafe && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute right-0 top-0 h-full w-3 bg-[#ff3b3b] shadow-[0_0_20px_#ff3b3b]" 
              />
            )}
          </motion.div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto">
          {nodes.map((node, index) => {
            const isSelected = activeNodeId === node.id;
            const isBlocked = node.status === "blocked";
            const isPending = node.status === "pending";
            const isUnsafe = node.status === "unsafe" || node.isRootCause;
            const isSafe = node.status === "safe";
            
            const Icon = STAGE_ICONS[node.id] || MapPin;

            return (
              <motion.div
                key={node.id}
                className={cn(
                  "flex flex-col items-center w-full transition-all duration-500",
                  isSelected ? "scale-105" : "scale-100",
                  (isBlocked || isPending) && "opacity-40"
                )}
                onClick={() => !isBlocked && setActiveNodeId(node.id)}
              >
                {/* Node Icon Circle */}
                <div className="relative mb-8">
                  <motion.div
                    animate={
                      isUnsafe
                        ? { scale: [1, 1.1, 1], boxShadow: `0 0 40px rgba(255,59,59,0.6)` }
                        : isSafe && hasData
                          ? { boxShadow: `0 0 30px rgba(0,255,159,0.3)` }
                          : {}
                    }
                    transition={isUnsafe ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }}
                    className={cn(
                      "w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 bg-black/90 transition-all duration-500 relative z-20",
                      isSafe ? "border-[#00ff9f]/50 text-[#00ff9f]" :
                      isUnsafe ? "border-[#ff3b3b]/50 text-[#ff3b3b]" :
                      "border-white/5 text-gray-500"
                    )}
                  >
                    {isBlocked ? <Ban className="w-10 h-10" /> : <Icon className="w-10 h-10" />}
                  </motion.div>
                  
                  {isUnsafe && <span className="absolute -inset-2 rounded-[2.5rem] border-2 border-[#ff3b3b] animate-ping opacity-30" />}
                </div>

                {/* Stage Info Card */}
                <GlassCard className={cn(
                  "w-full p-6 text-center border transition-all duration-500",
                  isSafe ? "border-[#00ff9f]/20 bg-[#00ff9f]/5" :
                  isUnsafe ? "border-[#ff3b3b]/30 bg-[#ff3b3b]/10" :
                  "border-white/5 bg-white/[0.02]"
                )}>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">{node.name}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">{node.actor}</p>
                  
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    isSafe ? "border-[#00ff9f]/30 text-[#00ff9f] bg-[#00ff9f]/5" :
                    isUnsafe ? "border-[#ff3b3b]/40 text-[#ff3b3b] bg-[#ff3b3b]/10" :
                    "border-white/10 text-gray-500"
                  )}>
                    {isSafe ? '✓ Verified Safe' : isUnsafe ? '⚠ Compromised' : isBlocked ? '× Flow Blocked' : 'Pending'}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── DETAILED INSIGHTS ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeNode.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <GlassCard className={cn(
            "p-10 rounded-[2.5rem] border-2 transition-all duration-700",
            activeNode.status === 'safe' ? "border-[#00ff9f]/20 bg-[#00ff9f]/5" :
            (activeNode.status === 'unsafe' || activeNode.isRootCause) ? "border-[#ff3b3b]/20 bg-[#ff3b3b]/5" :
            "border-white/10 bg-white/[0.02]"
          )}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Col: Analysis */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "w-20 h-20 rounded-[1.5rem] border-2 flex items-center justify-center",
                    activeNode.status === 'safe' ? "border-[#00ff9f]/30 text-[#00ff9f]" :
                    (activeNode.status === 'unsafe' || activeNode.isRootCause) ? "border-[#ff3b3b]/30 text-[#ff3b3b]" :
                    "border-white/10 text-gray-500"
                  )}>
                    <Activity className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">AI Diagnosis</h3>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-1">Stage: {activeNode.name}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/60 p-6 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 italic">Molecular Parameters</p>
                    <p className="text-white font-bold leading-relaxed">
                      {activeNode.status === 'pending' ? "Awaiting sensor telemetry..." : 
                       activeNode.status === 'blocked' ? "Downstream flow terminated due to upstream failure." :
                       activeNode.reason || "Diagnosis in progress..."}
                    </p>
                  </div>
                  <div className="bg-black/60 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Action Taken</p>
                    <h4 className={cn("text-2xl font-black uppercase italic mt-2", 
                      activeNode.status === 'safe' ? "text-[#00ff9f]" : "text-[#ff3b3b]")}>
                      {activeNode.status === 'safe' ? '>> Forward Flow Enabled' : '>> Pipeline Terminated'}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Right Col: Registry */}
              <div className="bg-black/80 rounded-3xl p-8 border border-white/10 space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <h4 className="text-white font-black text-lg italic flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-[#00cfff]" /> Network Registry
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase mb-1 tracking-widest">Transaction Status</p>
                      <p className="text-xs font-black text-[#00ff9f] uppercase tracking-tighter italic">Immutable Hash Verified ✓</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <p className="text-[8px] text-gray-500 font-black uppercase mb-1 tracking-widest">Batch Reference</p>
                      <p className="text-xs font-mono text-[#00cfff] font-bold">{batchId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => blockchain.txHash !== 'N/A' && window.open(`https://stellar.expert/explorer/testnet/tx/${blockchain.txHash}`, '_blank')}
                  className="w-full h-14 bg-[#00cfff]/10 border-2 border-[#00cfff]/30 text-[#00cfff] font-black uppercase tracking-widest hover:bg-[#00cfff]/20"
                >
                  Network Explorer <ExternalLink className="w-4 h-4 ml-3" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

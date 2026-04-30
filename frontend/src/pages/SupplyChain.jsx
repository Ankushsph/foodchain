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
  processing: Factory,
  distributor: Truck,
  retail: Store,
};

// Stage display names
const STAGE_LABELS = {
  farm: "Farm",
  processing: "Processing",
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

  const isChainSafe = decision === 'ALLOW' || (!hasData);

  // Flow progress: stop at root cause index if blocked
  const rootCauseIndex = rootCause ? STAGES.indexOf(rootCause) : -1;
  const flowStopIndex = (decision !== 'ALLOW' && rootCauseIndex !== -1) ? rootCauseIndex : STAGES.length - 1;
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

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Supply Chain <span className="text-[#00ff9f]">Pipeline</span>
          </h1>
          <p className="text-[#00cfff] mt-2 font-mono text-[10px] tracking-[0.3em] uppercase opacity-80">
            Real-time Autonomous Quality Enforcement
          </p>
          {hasData && batchId && (
            <p className="text-gray-500 font-mono text-[10px] tracking-widest mt-1 uppercase">
              Batch: <span className="text-white font-black">{batchId}</span>
              {rootCause && (
                <> · Root Cause: <span className="text-[#ff3b3b] font-black uppercase">{rootCause}</span></>
              )}
            </p>
          )}
        </div>
        <div className="hidden md:block">
          <Badge
            variant={isChainSafe ? "safe" : (hasData ? "unsafe" : "default")}
            className={cn(
              "px-6 py-2 text-xs font-black tracking-widest border-2",
              hasData && decision ? decisionBadge[decision] : "border-white/10 text-gray-500"
            )}
          >
            {!hasData
              ? "PIPELINE IDLE"
              : decision === "ALLOW"
                ? "PIPELINE SECURE"
                : decision === "BLOCK_BATCH"
                  ? "BATCH BLOCKED"
                  : "SUPPLY STOPPED"
            }
          </Badge>
        </div>
      </div>

      {/* ── Alert Banner (contamination) ── */}
      <AnimatePresence>
        {hasData && !isChainSafe && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-center">
            <div className="w-full max-w-5xl px-8 py-6 rounded-2xl bg-gradient-to-r from-[#ff3b3b]/20 via-[#ff3b3b]/10 to-[#ff3b3b]/20 border-2 border-[#ff3b3b]/40 shadow-[0_0_40px_rgba(255,59,59,0.2)] flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              <BrainCircuit className="w-12 h-12 text-[#ff3b3b] animate-pulse shrink-0" />
              <div>
                <h2 className="text-2xl font-black text-[#ff3b3b] tracking-tighter uppercase italic">
                  Contamination detected at {rootCause?.toUpperCase()}
                </h2>
                <p className="text-white/80 text-sm font-bold mt-1 uppercase tracking-tight">
                  Decision: {decision?.replace(/_/g, " ")} · Reason: {rootCauseReason || aiResult.reason}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pipeline Visualization ── */}
      <div className="relative py-16 px-4 md:px-12 bg-white/[0.02] rounded-[2.5rem] border border-white/5 backdrop-blur-md">

        {/* Connection Line (spans 4 nodes) */}
        <div className="absolute top-[32%] left-[10%] right-[10%] h-1.5 bg-white/5 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full relative transition-colors duration-1000",
              isChainSafe ? "bg-[#00ff9f]" : "bg-[#00ff9f]"
            )}
            initial={{ width: 0 }}
            animate={{ width: hasData ? flowWidthPct : '0%' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {/* Flow halt indicator */}
            {hasData && !isChainSafe && (
              <div className="absolute right-0 top-0 h-full w-2 bg-[#ff3b3b] shadow-[0_0_15px_#ff3b3b] animate-pulse" />
            )}
            {/* Safe flow pulse */}
            {hasData && isChainSafe && (
              <motion.div
                className="absolute top-1/2 right-0 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#fff] -translate-y-1/2"
                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.div>
        </div>

        {/* 4-Stage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 max-w-6xl mx-auto">
          {nodes.map((node, index) => {
            const isSelected = activeNodeId === node.id;
            const isBlocked = node.status === "blocked";
            const isPending = node.status === "pending";
            const isRootCause = node.isRootCause === true;
            const nodeTheme = getNodeTheme(node.status, isRootCause);
            const Icon = STAGE_ICONS[node.id] || MapPin;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={cn(
                  "flex flex-col items-center group w-full",
                  isBlocked || isPending ? "cursor-not-allowed" : "cursor-pointer"
                )}
                onClick={() => !isBlocked && setActiveNodeId(node.id)}
              >
                {/* Node Icon */}
                <div className="relative mb-6">
                  <motion.div
                    animate={
                      isRootCause
                        ? { scale: [1, 1.06, 1], boxShadow: `0 0 50px ${nodeTheme.glow}` }
                        : isSelected
                          ? { scale: 1.08 }
                          : { scale: 1 }
                    }
                    transition={isRootCause ? { duration: 1.8, repeat: Infinity } : { duration: 0.3 }}
                    className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 bg-black/80 relative z-20",
                      isSelected ? nodeTheme.border : "border-white/5",
                      nodeTheme.text
                    )}
                    style={{
                      boxShadow: isSelected && hasData
                        ? `0 0 50px ${nodeTheme.glow}, inset 0 0 20px ${nodeTheme.glow}`
                        : `0 0 10px ${nodeTheme.glow}`
                    }}
                  >
                    <motion.div animate={node.status === 'safe' && hasData ? { y: [-3, 3, -3], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } } : {}}>
                      {isBlocked
                        ? <Ban className="w-9 h-9 text-gray-500" />
                        : <Icon className={cn("w-9 h-9 drop-shadow-lg", nodeTheme.text)} />
                      }
                    </motion.div>
                  </motion.div>

                  {/* Root cause / unsafe ping ring */}
                  {(isRootCause || node.status === 'unsafe') && (
                    <span className="absolute -inset-2 rounded-3xl border-2 border-[#ff3b3b] animate-ping opacity-40" />
                  )}

                  {/* Stage index badge */}
                  <div className={cn(
                    "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black z-30 border",
                    node.status === 'safe' ? "bg-[#00ff9f]/20 border-[#00ff9f]/40 text-[#00ff9f]" :
                      node.status === 'unsafe' || isRootCause ? "bg-[#ff3b3b]/20 border-[#ff3b3b]/40 text-[#ff3b3b]" :
                        "bg-white/10 border-white/20 text-gray-400"
                  )}>
                    {index + 1}
                  </div>
                </div>

                {/* Card */}
                <div className={cn(
                  "w-full min-h-[200px] p-5 rounded-2xl border transition-all duration-500 relative z-20",
                  "bg-white/[0.04] backdrop-blur-md",
                  isSelected
                    ? `${nodeTheme.border} -translate-y-2 shadow-[0_15px_40px_rgba(0,0,0,0.5)]`
                    : "border-white/5 hover:border-white/10 hover:-translate-y-1",
                  (isBlocked || isPending) && "opacity-60"
                )}>
                  {/* Stage name */}
                  <div className="text-center mb-4">
                    <h3 className="font-black text-base text-white uppercase tracking-tighter italic">
                      {node.name}
                    </h3>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{node.actor}</p>
                    <div className={cn("h-0.5 w-8 mx-auto mt-1 rounded-full",
                      node.status === 'safe' ? "bg-[#00ff9f]/30" :
                        (node.status === 'unsafe' || isRootCause) ? "bg-[#ff3b3b]/30" : "bg-white/10"
                    )} />
                  </div>

                  <div className="space-y-3">
                    {/* Root cause badge */}
                    {isRootCause && (
                      <div className="px-3 py-1 rounded-lg bg-[#ff3b3b]/10 border border-[#ff3b3b]/30 text-center">
                        <p className="text-[8px] font-black text-[#ff3b3b] uppercase tracking-widest">⚠ Root Cause</p>
                      </div>
                    )}

                    {/* Status pill */}
                    <div className={cn(
                      "px-3 py-2 rounded-lg flex items-center justify-center font-black text-[9px] uppercase tracking-widest border",
                      nodeTheme.pill
                    )}>
                      {nodeTheme.label}
                    </div>

                    {/* Blocked sub-label */}
                    {isBlocked && (
                      <p className="text-[8px] text-[#ff3b3b] font-black uppercase text-center leading-tight">
                        Supply halted due to<br />contamination upstream
                      </p>
                    )}

                    {/* Pending sub-label */}
                    {isPending && (
                      <p className="text-[8px] text-gray-500 font-black uppercase text-center leading-tight">
                        Awaiting stage data
                      </p>
                    )}

                    {/* Risk badge if data exists */}
                    {node.status !== 'pending' && node.status !== 'blocked' && node.risk && node.risk !== 'NONE' && (
                      <div className={cn(
                        "px-2 py-1 rounded-md text-center border text-[8px] font-black uppercase",
                        node.risk === 'HIGH' ? "bg-[#ff3b3b]/10 border-[#ff3b3b]/20 text-[#ff3b3b]" :
                          node.risk === 'MEDIUM' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                            "bg-[#00ff9f]/10 border-[#00ff9f]/20 text-[#00ff9f]"
                      )}>
                        {node.risk} RISK
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNode.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className={cn(
            "p-8 rounded-3xl border-2 transition-all duration-700",
            (activeNode.status === 'safe') ? "border-[#00ff9f]/20 shadow-[0_0_50px_rgba(0,255,159,0.1)]" :
              (activeNode.status === 'unsafe' || activeNode.isRootCause) ? "border-[#ff3b3b]/20 shadow-[0_0_50px_rgba(255,59,59,0.1)]" :
                "border-white/10"
          )}>
            <div className="flex flex-col lg:flex-row gap-10 relative z-10">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-20 h-20 rounded-2xl border flex items-center justify-center shadow-lg",
                    activeNode.status === 'safe'
                      ? "bg-[#00ff9f]/10 border-[#00ff9f]/40 text-[#00ff9f]"
                      : (activeNode.status === 'unsafe' || activeNode.isRootCause)
                        ? "bg-[#ff3b3b]/10 border-[#ff3b3b]/40 text-[#ff3b3b]"
                        : "bg-white/5 border-white/10 text-gray-500"
                  )}>
                    {activeNode.status === 'safe'
                      ? <ShieldCheck className="w-12 h-12" />
                      : (activeNode.status === 'unsafe' || activeNode.isRootCause)
                        ? <AlertTriangle className="w-12 h-12 animate-pulse" />
                        : <Activity className="w-12 h-12 opacity-40" />
                    }
                  </div>
                  <div>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em] mb-1 font-black">AI Insight — {activeNode.name}</p>
                    <h3 className={cn(
                      "text-4xl font-black tracking-tighter uppercase italic",
                      activeNode.status === 'safe' ? "text-white" :
                        (activeNode.status === 'unsafe' || activeNode.isRootCause) ? "text-[#ff3b3b]" : "text-gray-500"
                    )}>
                      {activeNode.status === 'safe'
                        ? "Quality Verified"
                        : activeNode.status === 'unsafe'
                          ? "Anomaly Detected"
                          : activeNode.status === 'blocked'
                            ? "Stage Blocked"
                            : "Awaiting Data"
                      }
                    </h3>
                    {activeNode.isRootCause && (
                      <p className="text-[10px] font-black text-[#ff3b3b] uppercase tracking-widest mt-1">⚠ Root Cause of Contamination</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">Stage Reference</p>
                    <p className="text-white font-bold text-xl uppercase tracking-tighter">{activeNode.name}</p>
                    <p className="text-gray-500 text-[10px] font-black uppercase mt-1">{activeNode.actor}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-2">Diagnosis Summary</p>
                    <p className="text-white font-bold leading-tight text-sm">
                      {activeNode.status === 'pending'
                        ? "No data submitted for this stage yet."
                        : activeNode.status === 'blocked'
                          ? "Supply halted due to contamination at an earlier stage."
                          : activeNode.status === 'safe'
                            ? "All molecular parameters verified safe."
                            : activeNode.reason || "Anomalous pattern detected."
                      }
                    </p>
                  </div>
                  <div className="bg-black/60 p-6 rounded-2xl border border-white/5 md:col-span-2">
                    <p className={cn(
                      "font-black text-xl tracking-tighter uppercase italic",
                      activeNode.status === 'safe' ? "text-[#00ff9f]" :
                        activeNode.status === 'pending' ? "text-gray-500" : "text-[#ff3b3b]"
                    )}>
                      {activeNode.status === 'safe'
                        ? ">> STATUS: SECURE / NEXT NODE ENABLED"
                        : activeNode.status === 'blocked'
                          ? ">> STATUS: BLOCKED / SUPPLY HALTED UPSTREAM"
                          : activeNode.status === 'unsafe'
                            ? ">> STATUS: COMPROMISED / FLOW HALTED"
                            : ">> SYSTEM IDLE / STAGE PENDING"
                      }
                    </p>
                    {hasData && decision && (
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
                        Batch Decision: <span className={cn(
                          "font-black",
                          decision === "ALLOW" ? "text-[#00ff9f]" : "text-[#ff3b3b]"
                        )}>{decision.replace("_", " ")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Blockchain Panel */}
              <div className="lg:w-96 bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-black text-lg flex items-center gap-3 mb-8 italic">
                    <LinkIcon className="w-5 h-5 text-[#00cfff]" /> Blockchain Registry
                  </h4>
                  <div className="space-y-6">
                    <div className={cn(
                      "flex items-center gap-3 text-[10px] font-black p-4 rounded-xl border uppercase",
                      hasData ? "text-[#00ff9f] bg-[#00ff9f]/5 border-[#00ff9f]/20" : "text-gray-500 bg-white/5 border-white/10"
                    )}>
                      <CheckCircle2 className="w-5 h-5" />
                      {hasData ? "Immutable Entry Verified" : "Awaiting Transaction"}
                    </div>
                    {/* Batch ID */}
                    <div className="bg-black/60 p-5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Batch ID</p>
                      <p className="font-mono text-[11px] text-[#00cfff] font-black uppercase">{blockchain.batchId || 'N/A'}</p>
                    </div>
                    <div className="bg-black/60 p-5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Tx Hash</p>
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#00cfff]">
                        <span className="truncate mr-4">{shortHash}</span>
                        <button onClick={handleCopy} disabled={!hasData} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30">
                          {copied ? <Check className="w-4 h-4 text-[#00ff9f]" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button disabled={!hasData} className="w-full mt-10 h-14 bg-transparent border-2 border-[#00cfff]/30 text-[#00cfff] font-black uppercase tracking-widest hover:bg-[#00cfff]/10 disabled:opacity-30">
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

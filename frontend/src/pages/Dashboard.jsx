import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, BrainCircuit, AlertTriangle, Search, MapPin, Package, Truck, Hash, CheckCircle2, XCircle, Lock, ChevronRight } from 'lucide-react';
import useStore, { STAGES, STAGE_LABELS, PRODUCT_LIMITS } from '../store/useStore';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const AnimatedNumber = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const anim = animate(count, value, { duration: 1.5 });
    rounded.onChange(v => setDisplayValue(v));
    return anim.stop;
  }, [value]);
  return <motion.span>{displayValue}</motion.span>;
};

const STAGE_ICONS_MAP = { farm: '🌾', processing: '🏭', distributor: '🚚', retail: '🏪' };

export const Dashboard = () => {
  const {
    fetchAiAnalysis, isAnalyzing, hasData,
    batchId, selectedProduct, selectedDistributor, batchHistory,
    rootCause, rootCauseReason, decision, aiResult, distributorInfo,
    inputTds, inputColor, setInputs,
  } = useStore();

  const [error, setError] = useState('');
  // Per-stage TDS/Color local inputs
  const [stageInputs, setStageInputs] = useState({ farm: { tds: '', color: '' }, processing: { tds: '', color: '' }, distributor: { tds: '', color: '' }, retail: { tds: '', color: '' } });
  const [batchLocked, setBatchLocked] = useState(false);

  // Build stage result map from batchHistory
  const stageResults = useMemo(() => {
    const map = {};
    batchHistory.forEach(e => { map[e.stage] = e; });
    return map;
  }, [batchHistory]);

  // Determine active input stage (next stage to submit)
  const activeInputStage = useMemo(() => {
    if (decision && decision !== 'ALLOW') return null; // flow stopped
    for (const s of STAGES) {
      if (!stageResults[s]) return s;
    }
    return null; // all 4 done
  }, [stageResults, decision]);

  // Which stages are visible: all stages up to and including activeInputStage
  const visibleStages = useMemo(() => {
    const activeIdx = activeInputStage ? STAGES.indexOf(activeInputStage) : STAGES.length - 1;
    // If flow stopped, show up to root cause only
    if (decision && decision !== 'ALLOW' && rootCause) {
      const rcIdx = STAGES.indexOf(rootCause);
      return STAGES.slice(0, rcIdx + 1);
    }
    return STAGES.slice(0, activeIdx + 1);
  }, [activeInputStage, decision, rootCause]);

  const batchIsUnsafe = hasData && decision && decision !== 'ALLOW';
  const glow = !hasData ? '#4b5563' : batchIsUnsafe ? '#ff3b3b' : '#00ff9f';
  const cardBorder = !hasData ? 'border-white/10' : batchIsUnsafe ? 'border-[#ff3b3b]/50' : 'border-[#00ff9f]/40';

  const limits = PRODUCT_LIMITS[selectedProduct] || PRODUCT_LIMITS.default;

  const handleSubmitStage = async (stage) => {
    const tds = stageInputs[stage]?.tds;
    const color = stageInputs[stage]?.color;
    
    // Validate required fields
    const isDistributorStage = stage === 'distributor';
    const hasDistributor = isDistributorStage ? !!selectedDistributor : true;

    if (!batchId || !selectedProduct || !hasDistributor || !tds || !color) {
      setError(`Please fill in all required fields for ${STAGE_LABELS[stage]} analysis`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    setBatchLocked(true);
    // sync stage inputs to store for sensor card display
    setInputs({ 
      selectedStage: stage, 
      inputTds: tds, 
      inputColor: color,
      // If not distributor stage and distributor not set, send a placeholder
      selectedDistributor: isDistributorStage ? selectedDistributor : (selectedDistributor || "Initial Provider")
    });
    await fetchAiAnalysis({ 
      batch_id: batchId, 
      stage, 
      tds: Number(tds), 
      color: Number(color), 
      product: selectedProduct, 
      distributor: isDistributorStage ? selectedDistributor : (selectedDistributor || "Initial Provider")
    });
  };

  const updateStageInput = (stage, field, val) => {
    setStageInputs(prev => ({ ...prev, [stage]: { ...prev[stage], [field]: val } }));
  };

  const tdsVal = hasData ? Number(inputTds) : 0;
  const colorVal = hasData ? Number(inputColor) : 0;
  const tdsOver = hasData && tdsVal > limits.tds;
  const colorOver = hasData && colorVal < limits.color;
  const isCurSafe = aiResult.status === 'SAFE';
  const glow2 = isCurSafe ? '#00ff9f' : '#ff3b3b';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── BATCH SETUP CARD (always visible, locks after first submit) ── */}
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-5xl border-[#00ff9f]/20 bg-[#00ff9f]/5 shadow-[0_0_40px_rgba(0,255,159,0.05)]">
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[#00ff9f]/10 rounded-2xl border border-[#00ff9f]/20">
                <BrainCircuit className="w-8 h-8 text-[#00ff9f]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Batch Configuration</h3>
                <p className="text-sm text-gray-400">Set once — submit each stage sequentially using the same Batch ID</p>
              </div>
              {batchLocked && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff9f]/10 border border-[#00ff9f]/20">
                  <Lock className="w-3 h-3 text-[#00ff9f]" />
                  <span className="text-[9px] font-black text-[#00ff9f] uppercase tracking-widest">Locked</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-[#00ff9f]/70 ml-1 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Batch ID
                </label>
                <input type="text" value={batchId} onChange={e => setInputs({ batchId: e.target.value })} disabled={batchLocked}
                  className={cn("bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00ff9f]/50 outline-none", batchLocked && "opacity-60 cursor-not-allowed")}
                  placeholder="e.g. MILK-001" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black text-[#00ff9f]/70 ml-1 flex items-center gap-2">
                  <Package className="w-3 h-3" /> Product
                </label>
                <select value={selectedProduct} onChange={e => setInputs({ selectedProduct: e.target.value })} disabled={batchLocked}
                  className={cn("bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00ff9f]/50 outline-none appearance-none cursor-pointer", batchLocked && "opacity-60 cursor-not-allowed")}>
                  <option value="" disabled className="bg-black">Choose Product</option>
                  <option value="milk" className="bg-black">Milk</option>
                  <option value="water" className="bg-black">Water</option>
                  <option value="juice" className="bg-black">Juice</option>
                </select>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── STAGE-BY-STAGE FLOW ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-5xl space-y-4">

          {visibleStages.map((stage, idx) => {
            const result = stageResults[stage];
            const isActive = stage === activeInputStage;
            const isUnsafe = result && result.status === 'unsafe';
            const isSafe = result && result.status === 'safe';
            const isRootCause = stage === rootCause;

            return (
              <AnimatePresence key={stage}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  {/* ── Completed SAFE stage ── */}
                  {isSafe && !isRootCause && (
                    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#00ff9f]/5 border border-[#00ff9f]/20">
                      <CheckCircle2 className="w-6 h-6 text-[#00ff9f] shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-black text-[#00ff9f]/60 uppercase tracking-widest">{STAGE_ICONS_MAP[stage]} {STAGE_LABELS[stage]}</span>
                        <p className="text-base font-black text-[#00ff9f] uppercase">SAFE — {result.reason}</p>
                      </div>
                      <Badge variant="safe" className="text-[9px] font-black uppercase">✓ Cleared</Badge>
                      {idx < visibleStages.length - 1 && <ChevronRight className="w-4 h-4 text-[#00ff9f]/40" />}
                    </div>
                  )}

                  {/* ── Completed UNSAFE / root cause stage ── */}
                  {(isUnsafe || isRootCause) && (
                    <motion.div
                      animate={{ scale: [1, 1.01, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="px-6 py-5 rounded-2xl bg-[#ff3b3b]/10 border-2 border-[#ff3b3b]/40 shadow-[0_0_30px_rgba(255,59,59,0.15)]"
                    >
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-[#ff3b3b] animate-pulse shrink-0" />
                        <div className="flex-1">
                          <span className="text-[9px] font-black text-[#ff3b3b]/60 uppercase tracking-widest">{STAGE_ICONS_MAP[stage]} {STAGE_LABELS[stage]} — Root Cause</span>
                          <p className="text-xl font-black text-[#ff3b3b] uppercase tracking-tight">
                            Contamination Detected at {STAGE_LABELS[stage].toUpperCase()}
                          </p>
                          <p className="text-sm text-white/70 mt-1 font-bold">{result.reason}</p>
                        </div>
                        <Badge variant="unsafe" className="text-[9px] font-black uppercase animate-pulse">
                          {decision?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[#ff3b3b]/60 font-black uppercase mt-3 tracking-widest">
                        ⛔ Supply flow stopped — all downstream stages blocked
                      </p>
                    </motion.div>
                  )}

                  {/* ── Active input stage ── */}
                  {isActive && (
                    <GlassCard className="border-[#00ff9f]/20 bg-[#00ff9f]/5 shadow-[0_0_30px_rgba(0,255,159,0.05)]">
                      <div className="flex flex-col gap-5 p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#00ff9f]/10 border border-[#00ff9f]/20 flex items-center justify-center text-sm">
                            {STAGE_ICONS_MAP[stage]}
                          </div>
                          <div>
                            <p className="text-[10px] text-[#00ff9f]/60 font-black uppercase tracking-widest">Next Stage</p>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{STAGE_LABELS[stage]} Analysis</h4>
                          </div>
                        </div>
                        <div className={cn("grid gap-4", stage === 'distributor' ? "grid-cols-1" : "grid-cols-2")}>
                          {stage === 'distributor' && (
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-black text-[#00ff9f]/70 ml-1 flex items-center gap-2">
                                <Truck className="w-3 h-3" /> Select Distributor
                              </label>
                              <select value={selectedDistributor} onChange={e => setInputs({ selectedDistributor: e.target.value })}
                                className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00ff9f]/50 outline-none appearance-none cursor-pointer">
                                <option value="" disabled className="bg-black">Choose Distributor</option>
                                {['A','B','C','D','E'].map(c => <option key={c} value={`Distributor ${c}`} className="bg-black">Distributor {c}</option>)}
                              </select>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-black text-[#00ff9f]/70 ml-1 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> TDS Level (ppm)
                              </label>
                              <input type="number" value={stageInputs[stage]?.tds} onChange={e => updateStageInput(stage, 'tds', e.target.value)}
                                className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00ff9f]/50 outline-none"
                                placeholder="0.00" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase font-black text-[#00ff9f]/70 ml-1 flex items-center gap-2">
                                <Search className="w-3 h-3" /> Color Index
                              </label>
                              <input type="number" value={stageInputs[stage]?.color} onChange={e => updateStageInput(stage, 'color', e.target.value)}
                                className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-[#00ff9f]/50 outline-none"
                                placeholder="0.00" />
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#ff3b3b] text-xs font-bold uppercase tracking-widest text-center">{error}</motion.p>}
                        </AnimatePresence>
                        <Button onClick={() => handleSubmitStage(stage)} disabled={isAnalyzing}
                          className={cn("h-12 w-full rounded-xl font-black uppercase tracking-[0.2em] transition-all",
                            isAnalyzing ? "opacity-50" : "bg-[#00ff9f] text-black hover:shadow-[0_0_30px_#00ff9f]")}>
                          {isAnalyzing ? 'Analyzing...' : `Analyze ${STAGE_LABELS[stage]}`}
                        </Button>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              </AnimatePresence>
            );
          })}

          {/* All 4 stages complete and ALLOW */}
          {decision === 'ALLOW' && batchHistory.length === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-6 rounded-2xl bg-[#00ff9f]/10 border-2 border-[#00ff9f]/30 shadow-[0_0_40px_rgba(0,255,159,0.15)] text-center">
              <ShieldCheck className="w-12 h-12 text-[#00ff9f] mx-auto mb-3" />
              <h2 className="text-2xl font-black text-[#00ff9f] uppercase tracking-tight">Full Pipeline Cleared</h2>
              <p className="text-gray-400 text-sm mt-1 font-bold uppercase tracking-wide">All 4 stages verified safe — supply approved</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── ANALYTICS CARDS (shown after any submission) ── */}
      <AnimatePresence>
        {hasData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="absolute -inset-10 blur-[120px] pointer-events-none rounded-full opacity-10 z-0 transition-colors duration-1000"
              style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />

            {/* Sensor Metrics */}
            <GlassCard className={cn("h-[300px] flex flex-col transition-all duration-700 relative z-10", cardBorder)}>
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: glow }} /> Sensor Metrics
                </h3>
                <Badge variant={isCurSafe ? 'safe' : 'unsafe'}>Live</Badge>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] text-gray-500 font-black uppercase">TDS Level</p>
                    <span className={cn("text-[9px] font-black uppercase flex items-center gap-1", tdsOver ? "text-[#ff3b3b]" : "text-[#00ff9f]")}>
                      {tdsOver ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />} Limit {limits.tds}
                    </span>
                  </div>
                  <p className={cn("text-4xl font-black tracking-tighter", tdsOver ? "text-[#ff3b3b]" : "text-white")}>
                    <AnimatedNumber value={tdsVal} /> <span className="text-sm text-gray-500">ppm</span>
                  </p>
                  {tdsOver && <p className="text-[9px] text-[#ff3b3b] font-black uppercase">↑ {tdsVal - limits.tds} ppm over limit</p>}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] text-gray-500 font-black uppercase">Color Index</p>
                    <span className={cn("text-[9px] font-black uppercase flex items-center gap-1", colorOver ? "text-[#ff3b3b]" : "text-[#00ff9f]")}>
                      {colorOver ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />} Limit {limits.color}
                    </span>
                  </div>
                  <p className={cn("text-4xl font-black tracking-tighter", colorOver ? "text-[#ff3b3b]" : "text-white")}>
                    <AnimatedNumber value={colorVal} /> <span className="text-sm text-gray-500">unit</span>
                  </p>
                  {colorOver && <p className="text-[9px] text-[#ff3b3b] font-black uppercase">↓ {limits.color - colorVal} below limit</p>}
                </div>
              </div>
            </GlassCard>

            {/* AI Prediction */}
            <GlassCard className={cn("h-[300px] flex flex-col transition-all duration-700 relative z-10", cardBorder, batchIsUnsafe ? "bg-[#ff3b3b]/5" : "bg-[#00ff9f]/5")}>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-5">
                <BrainCircuit className="w-4 h-4 text-[#00cfff]" /> AI Prediction
              </h3>
              <div className="flex flex-col items-center justify-center flex-1">
                <h2 className="text-3xl font-black uppercase mb-4" style={{ color: glow2 }}>{aiResult.status}</h2>
                <span className="text-5xl font-black text-white">
                  <AnimatedNumber value={aiResult.confidence} /><span className="text-xl opacity-30">%</span>
                </span>
                <span className="text-[10px] text-[#00cfff] font-black uppercase tracking-widest mt-1">Confidence</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Reason</p>
                <p className="text-xs font-bold text-white/90">{aiResult.reason}</p>
              </div>
            </GlassCard>

            {/* Risk Intelligence */}
            <GlassCard className={cn("h-[300px] flex flex-col transition-all duration-700 relative z-10", cardBorder)}>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-5">
                <Search className="w-4 h-4 text-[#fffb00]" /> Risk Intelligence
              </h3>
              <div className="flex-1 space-y-3 flex flex-col justify-center">
                <div className="flex flex-col items-center">
                  <Badge className="px-5 py-2 text-base mb-2" variant={aiResult.risk === 'HIGH' ? 'unsafe' : aiResult.risk === 'MEDIUM' ? 'warning' : 'safe'}>
                    {aiResult.risk} RISK
                  </Badge>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-500">Stage</span>
                    <span className="text-white">{useStore.getState().selectedStage || '—'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-500">Triggered By</span>
                    <span className={cn("text-right max-w-[55%] leading-tight text-[9px]", isCurSafe ? "text-[#00ff9f]" : "text-[#ff3b3b]")}>{aiResult.reason}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Supplier Trust</p>
                  <p className={cn("text-sm font-black", distributorInfo.score > 70 && isCurSafe ? "text-[#00ff9f]" : "text-[#ff3b3b]")}>
                    {distributorInfo.score}% — {batchIsUnsafe ? 'COMPROMISED' : distributorInfo.status}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Logistics Trace */}
            <GlassCard className={cn("h-[300px] flex flex-col transition-all duration-700 relative z-10", cardBorder)}>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-[#7a5cff]" /> Logistics Trace
              </h3>
              <div className="flex-1 flex flex-col justify-center space-y-3">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Batch ID</p>
                    <p className="text-base font-black text-white uppercase">{batchId || 'N/A'}</p>
                  </div>
                  {rootCause && (
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Root Cause</p>
                      <p className="text-base font-black text-[#ff3b3b] uppercase">{rootCause}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: glow }} />
                    <span className="text-[10px] font-black text-gray-400 uppercase">{batchIsUnsafe ? 'COMPROMISED / ALERT' : 'ACTIVE / SECURE'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase px-1">
                    <span className="text-gray-500">Stages Done</span>
                    <span style={{ color: glow }}>{batchHistory.length}/4</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${(batchHistory.length / 4) * 100}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full" style={{ backgroundColor: glow }} />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Activity, BrainCircuit, AlertTriangle, Search,
  CheckCircle2, XCircle, Clock, Ban, Leaf, Truck, Store, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import useStore, { STAGES, STAGE_LABELS, PRODUCT_LIMITS } from '../store/useStore';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const STAGE_ICONS = { farm: Leaf, distributor: Truck, retail: Store };

// Delay helper
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export const Dashboard = () => {
  const {
    fetchAiAnalysis, isAnalyzing, hasData,
    batchId, selectedProduct, selectedDistributor, selectedRetailer,
    batchHistory, rootCause, decision, aiResult, distributorInfo, retailerInfo,
    inputTds, inputColor, setInputs, selectedStage, esp32Live, startEsp32Polling
  } = useStore();

  useEffect(() => {
    startEsp32Polling();
  }, [startEsp32Polling]);

  const [error, setError] = useState('');
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [currentRunStage, setCurrentRunStage] = useState(null); // which stage is actively being analyzed
  const [batchLocked, setBatchLocked] = useState(false);

  // Single-form inputs for the whole batch
  const [form, setForm] = useState({
    tds: '', color: '',
    farmerName: '',
    distributor: '', distTds: '', distColor: '',
    retailer: '', retailTds: '', retailColor: '',
    walletKey: ''
  });

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const stageResults = useMemo(() => {
    const map = {};
    batchHistory.forEach(e => { map[e.stage] = e; });
    return map;
  }, [batchHistory]);

  const limits = PRODUCT_LIMITS[selectedProduct] || PRODUCT_LIMITS.default;
  const batchIsUnsafe = hasData && decision === 'BLOCK_BATCH';
  const glow = !hasData ? '#4b5563' : batchIsUnsafe ? '#ff3b3b' : '#00ff9f';
  const isCurSafe = aiResult.status === 'SAFE';

  const nextStage = useMemo(() => {
    if (!stageResults['farm']) return 'farm';
    if (stageResults['farm'].status === 'safe' && !stageResults['distributor']) return 'distributor';
    if (stageResults['distributor']?.status === 'safe' && !stageResults['retail']) return 'retail';
    return null;
  }, [stageResults]);

  // ── RUN STAGE ANALYSIS ───────────────────────────────────────────────────
  const handleAnalyzeStage = async (stage) => {
    const finalBatchId = batchId || `BATCH-${Date.now()}`;
    const finalProduct = selectedProduct || 'milk';

    // Pick values based on stage
    const finalTds = (stage === 'farm' ? form.tds : stage === 'distributor' ? form.distTds : form.retailTds) || '220';
    const finalColor = (stage === 'farm' ? form.color : stage === 'distributor' ? form.distColor : form.retailColor) || '200';
    const finalDist = form.distributor;
    const finalRet = form.retailer;

    // Field Validation
    if (!form.walletKey) {
      toast.error("ENTER WALLET KEY TO VERIFY IDENTITY");
      return;
    }

    if (stage === 'farm') {
      if (!batchId && !form.tds) { // Allow blank batchId if it's the very first entry (it will auto-gen)
         // but we need farmerName and sensor values
      }
      if (!form.farmerName || !form.tds || !form.color) {
        toast.error("ENTER ALL FIELDS FOR FARM STAGE");
        return;
      }
    } else if (stage === 'distributor') {
      if (!form.distributor || !form.distTds || !form.distColor) {
        toast.error("ENTER ALL FIELDS FOR DISTRIBUTOR STAGE");
        return;
      }
    } else if (stage === 'retail') {
      if (!form.retailer || !form.retailTds || !form.retailColor) {
        toast.error("ENTER ALL FIELDS FOR RETAIL STAGE");
        return;
      }
    }

    setError('');
    setRunningPipeline(true);
    setCurrentRunStage(stage);

    // Sync store
    setInputs({
      batchId: finalBatchId,
      selectedProduct: finalProduct,
      selectedDistributor: finalDist,
      selectedRetailer: finalRet,
      selectedStage: stage,
      inputTds: finalTds,
      inputColor: finalColor,
    });

    try {
      const result = await fetchAiAnalysis({
        batch_id: finalBatchId,
        stage,
        tds: Number(finalTds),
        color: Number(finalColor),
        product: finalProduct,
        distributor: finalDist,
        retailer: finalRet,
        farmer_name: form.farmerName,
        wallet_key: form.walletKey
      });

      if (result && result.registered_key && result.registered_key !== form.walletKey) {
        updateForm('walletKey', result.registered_key);
        toast.success(`NEW IDENTITY REGISTERED! KEY: ${result.registered_key}`, { duration: 8000 });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningPipeline(false);
      setCurrentRunStage(null);
    }
  };

  const syncWithEsp32 = (stage) => {
    if (!esp32Live.connected) return;
    if (stage === 'farm') {
      setForm(prev => ({ ...prev, tds: esp32Live.tds, color: esp32Live.color }));
    } else if (stage === 'distributor') {
      setForm(prev => ({ ...prev, distTds: esp32Live.tds, distColor: esp32Live.color }));
    } else if (stage === 'retail') {
      setForm(prev => ({ ...prev, retailTds: esp32Live.tds, retailColor: esp32Live.color }));
    }
  };

  const handleReset = async () => {
    setBatchLocked(false);
    setRunningPipeline(false);
    setCurrentRunStage(null);
    setForm({
      tds: '', color: '',
      farmerName: '',
      distributor: '', distTds: '', distColor: '',
      retailer: '', retailTds: '', retailColor: '',
      walletKey: ''
    });

    try {
      await fetch("http://127.0.0.1:8000/reset", { method: "POST" });
    } catch (e) {
      console.error("Failed to reset backend:", e);
    }

    // Full reset via store defaults
    useStore.setState({
      hasData: false, batchId: '', batchHistory: [], rootCause: null, decision: null,
      rootCauseReason: '', selectedStage: '', inputTds: '', inputColor: '',
      selectedProduct: '', selectedDistributor: '', selectedRetailer: '',
      aiResult: { status: 'IDLE', risk: 'NONE', reason: '', confidence: 0 },
      distributorInfo: { name: '', score: 0, status: '' },
      retailerInfo: { name: '', status: '' },
      blockchain: { isConnected: false, batchId: 'N/A', txHash: 'N/A', event: null, verified: false },
      supplyChain: STAGES.map(s => ({
        id: s, name: STAGE_LABELS[s], actor: '', status: 'pending',
        risk: 'NONE', reason: '', tds: 0, color: 0, isRootCause: false,
      })),
    });
  };

  const tdsVal = hasData ? Number(inputTds) : 0;
  const colorVal = hasData ? Number(inputColor) : 0;

  const tdsOver = hasData && tdsVal > limits.tds;
  const colorOver = hasData && colorVal < limits.color;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── ALERT BANNER ── */}
      <AnimatePresence>
        {batchIsUnsafe && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-center">
            <div className="w-full max-w-5xl px-8 py-6 rounded-2xl bg-[#ff3b3b]/10 border-2 border-[#ff3b3b]/40 shadow-[0_0_50px_rgba(255,59,59,0.2)] flex items-center justify-center gap-6 text-center">
              <AlertTriangle className="w-10 h-10 text-[#ff3b3b] animate-pulse" />
              <h2 className="text-3xl font-black text-[#ff3b3b] uppercase tracking-tighter italic">
                {decision === 'BLOCK_BATCH' ? '🛑 Batch Blocked at ' : '🚨 Contamination at '}
                <span className="text-white">{rootCause?.toUpperCase()}</span>
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REAL-TIME ESP32 TELEMETRY ── */}
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-5xl bg-black/40 border-white/5 p-4 flex items-center justify-between overflow-hidden relative">
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border-2",
              esp32Live.connected ? "border-[#00ff9f]/30 bg-[#00ff9f]/5 text-[#00ff9f]" : "border-gray-800 text-gray-700"
            )}>
              <RefreshCw className={cn("w-6 h-6", esp32Live.connected && "animate-spin-slow")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Live ESP32 Stream</h4>
                <div className={cn("w-1.5 h-1.5 rounded-full", esp32Live.connected ? "bg-[#00ff9f] animate-pulse" : "bg-gray-800")} />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                {esp32Live.connected ? `Receiving: ${esp32Live.tds} PPM | ${esp32Live.color} COLOR` : "Hardware Offline — Waiting for sensor data"}
              </p>
            </div>
          </div>

          {esp32Live.connected && (
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[8px] text-gray-600 font-black uppercase">TDS LEVEL</p>
                <p className="text-xl font-black text-[#00ff9f] italic">{esp32Live.tds}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <p className="text-[8px] text-gray-600 font-black uppercase">COLOR IDX</p>
                <p className="text-xl font-black text-[#00d1ff] italic">{esp32Live.color}</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── BATCH CONFIG + SENSOR INPUTS ── */}
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-5xl border-[#00ff9f]/20 bg-[#00ff9f]/5 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <BrainCircuit className="w-8 h-8 text-[#00ff9f]" />
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Batch Sensor Input</h3>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Progressive multi-node verification enabled</p>
            </div>
            {hasData && (
              <div className="ml-auto flex gap-2">
                <Badge variant="outline" className="text-[#00ff9f] border-[#00ff9f]/30 font-black italic">ACTIVE BATCH</Badge>
                <button onClick={handleReset}
                  className="text-[9px] font-black uppercase text-gray-500 border border-white/10 px-3 py-1 rounded-lg hover:text-white hover:border-white/30 transition-all">
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Row 1: Core Identification (Always Visible) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Batch Tracking ID</label>
              <input type="text" value={batchId} onChange={e => setInputs({ batchId: e.target.value })}
                disabled={stageResults['farm']}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/50 transition-colors placeholder:text-gray-700"
                placeholder="e.g. BATCH-772" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Product Type</label>
              <select value={selectedProduct} onChange={e => setInputs({ selectedProduct: e.target.value })}
                disabled={stageResults['farm']}
                className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/50 transition-colors appearance-none cursor-pointer">
                <option value="">Select Product...</option>
                <option value="milk">🥛 Fresh Milk</option>
                <option value="water">💧 Mineral Water</option>
                <option value="juice">🧃 Fruit Juice</option>
              </select>
            </div>
          </div>

          {/* 🔐 UNIVERSAL IDENTITY LOCK */}
          <GlassCard className="p-6 border-[#00cfff]/30 bg-[#00cfff]/5 mb-8">
            <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#00cfff]/10 rounded-xl border border-[#00cfff]/30 shadow-[0_0_15px_rgba(0,207,255,0.2)]">
                  <ShieldCheck className="w-5 h-5 text-[#00cfff]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-[#00cfff] uppercase tracking-[0.2em] mb-1 italic">Identity Verification Protocol</h4>
                  <p className="text-[14px] font-black text-white uppercase italic tracking-tight">Active Actor Passkey Required</p>
                </div>
              </div>
              <div className="flex-1 max-w-md w-full">
                <input 
                  type="text" 
                  placeholder="ENTER PRIVATE WALLET KEY (VERIFIES IDENTITY)"
                  value={form.walletKey}
                  onChange={(e) => updateForm('walletKey', e.target.value.toUpperCase())}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-[#00cfff] placeholder:text-gray-600 focus:border-[#00cfff]/50 transition-all outline-none text-center tracking-[0.3em]"
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 text-center font-bold tracking-widest uppercase italic">
              * First-time users: This key will be registered to your name permanently on the blockchain.
            </p>
          </GlassCard>

          {/* Row 2: Initial Sensor Values (Always Visible) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative group">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#00ff9f]" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Farm Analysis Node</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-gray-500 ml-1 italic">Agricultural Source (Farm Name)</label>
                  <input type="text" value={form.farmerName} onChange={e => updateForm('farmerName', e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                    placeholder="ENTER FARM NAME" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Farm TDS (ppm)</label>
                  <input type="number" value={form.tds} onChange={e => updateForm('tds', e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                    placeholder="e.g. 220" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Farm Color Index</label>
                  <input type="number" value={form.color} onChange={e => updateForm('color', e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                    placeholder="e.g. 200" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-4 border-l border-white/5 pl-6">
              <div className="text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Live ESP32 Feed (Farm)</p>
                <div className="flex gap-4">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-[#00ff9f] italic">{esp32Live.connected ? esp32Live.tds : '--'}</p>
                    <p className="text-[7px] text-gray-700 font-bold">TDS</p>
                  </div>
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-[#00d1ff] italic">{esp32Live.connected ? esp32Live.color : '--'}</p>
                    <p className="text-[7px] text-gray-700 font-bold">COLOR</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => syncWithEsp32('farm')} disabled={!esp32Live.connected}
                  className="px-4 py-2 rounded-xl border border-[#00ff9f]/20 text-[9px] font-black text-[#00ff9f] uppercase hover:bg-[#00ff9f]/10 transition-all disabled:opacity-30 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Sync Data
                </button>
                <button onClick={() => handleAnalyzeStage('farm')} disabled={runningPipeline}
                  className="px-4 py-2 rounded-xl font-black uppercase text-[9px] bg-[#00ff9f]/20 text-[#00ff9f] border border-[#00ff9f]/30 hover:bg-[#00ff9f] hover:text-black transition-all flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Analyze
                </button>
              </div>
            </div>
            {stageResults['farm'] && (
              <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-[#00ff9f] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,159,0.5)]">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            )}
          </div>

          {/* Row 3: Conditional Distributor (after Farm) */}
          <AnimatePresence>
            {stageResults['farm']?.status === 'safe' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative group">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#00ff9f]" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Distributor Analysis Node</h4>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Distributor Name</label>
                    <input type="text" value={form.distributor} onChange={e => updateForm('distributor', e.target.value)}
                      className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                      placeholder="e.g. Global Logistics A" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Distributor TDS</label>
                      <input type="number" value={form.distTds} onChange={e => updateForm('distTds', e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                        placeholder="e.g. 225" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Distributor Color</label>
                      <input type="number" value={form.distColor} onChange={e => updateForm('distColor', e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00ff9f]/40"
                        placeholder="e.g. 195" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-4 border-l border-white/5 pl-6">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Live ESP32 Feed (Distributor)</p>
                    <div className="flex gap-4">
                      <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-[#00ff9f] italic">{esp32Live.connected ? esp32Live.tds : '--'}</p>
                        <p className="text-[7px] text-gray-700 font-bold">TDS</p>
                      </div>
                      <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-[#00d1ff] italic">{esp32Live.connected ? esp32Live.color : '--'}</p>
                        <p className="text-[7px] text-gray-700 font-bold">COLOR</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => syncWithEsp32('distributor')} disabled={!esp32Live.connected}
                      className="px-4 py-2 rounded-xl border border-[#00ff9f]/20 text-[9px] font-black text-[#00ff9f] uppercase hover:bg-[#00ff9f]/10 transition-all disabled:opacity-30 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" /> Sync Data
                    </button>
                    <button onClick={() => handleAnalyzeStage('distributor')} disabled={runningPipeline}
                      className="px-4 py-2 rounded-xl font-black uppercase text-[9px] bg-[#00ff9f]/20 text-[#00ff9f] border border-[#00ff9f]/30 hover:bg-[#00ff9f] hover:text-black transition-all flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Analyze
                    </button>
                  </div>
                </div>
                {stageResults['distributor'] && (
                  <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-[#00ff9f] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,159,0.5)]">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 4: Conditional Retailer (after Distributor) */}
          <AnimatePresence>
            {stageResults['distributor']?.status === 'safe' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative group">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#00d1ff]" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Retail Analysis Node</h4>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Retailer / Store Name</label>
                    <input type="text" value={form.retailer} onChange={e => updateForm('retailer', e.target.value)}
                      className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00d1ff]/40"
                      placeholder="e.g. Fresh Mart Retail" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Retail TDS</label>
                      <input type="number" value={form.retailTds} onChange={e => updateForm('retailTds', e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00d1ff]/40"
                        placeholder="e.g. 230" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-gray-500 ml-1">Retail Color</label>
                      <input type="number" value={form.retailColor} onChange={e => updateForm('retailColor', e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-[#00d1ff]/40"
                        placeholder="e.g. 190" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-4 border-l border-white/5 pl-6">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2">Live ESP32 Feed (Retail)</p>
                    <div className="flex gap-4">
                      <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-[#00ff9f] italic">{esp32Live.connected ? esp32Live.tds : '--'}</p>
                        <p className="text-[7px] text-gray-700 font-bold">TDS</p>
                      </div>
                      <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-[#00d1ff] italic">{esp32Live.connected ? esp32Live.color : '--'}</p>
                        <p className="text-[7px] text-gray-700 font-bold">COLOR</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => syncWithEsp32('retail')} disabled={!esp32Live.connected}
                      className="px-4 py-2 rounded-xl border border-[#00d1ff]/20 text-[9px] font-black text-[#00d1ff] uppercase hover:bg-[#00d1ff]/10 transition-all disabled:opacity-30 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" /> Sync Data
                    </button>
                    <button onClick={() => handleAnalyzeStage('retail')} disabled={runningPipeline}
                      className="px-6 py-2 rounded-xl font-black uppercase text-[10px] bg-[#00d1ff]/20 text-[#00d1ff] border border-[#00d1ff]/30 hover:bg-[#00d1ff] hover:text-black transition-all flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Analyze
                    </button>
                  </div>
                </div>
                {stageResults['retail'] && (
                  <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-[#00d1ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.5)]">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-[#ff3b3b] text-[10px] font-black uppercase text-center">{error}</p>}

          <div className="flex justify-center pt-2">
            {hasData && !runningPipeline && (
              <button onClick={handleReset}
                className="px-12 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 text-white hover:bg-white/5 transition-colors">
                Reset Full Batch
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ── PIPELINE STAGE PROGRESS ── */}
      <div className="flex justify-center">
        <div className="w-full max-w-5xl space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Pipeline Progress</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            {STAGES.map((stage) => {
              const result = stageResults[stage];
              const isRunning = currentRunStage === stage;
              const isUnsafe = result && result.status === 'unsafe';
              const isSafe = result && result.status === 'safe';
              const isBlocked = decision && decision !== 'ALLOW' && decision !== 'APPROVED_FOR_SALE' && result == null &&
                rootCause && STAGES.indexOf(stage) > STAGES.indexOf(rootCause);
              const isPending = !result && !isRunning && !isBlocked;
              const Icon = STAGE_ICONS[stage] || Activity;

              return (
                <AnimatePresence key={stage}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Running Stage */}
                    {isRunning && (
                      <GlassCard className="border-[#00cfff]/40 bg-[#00cfff]/5 px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl border-2 border-[#00cfff]/50 flex items-center justify-center text-[#00cfff]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-[#00cfff] uppercase tracking-widest">
                              Analyzing {STAGE_LABELS[stage]}...
                            </p>
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#00cfff] rounded-full"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                              />
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[#00cfff] border-[#00cfff]/30 animate-pulse text-[9px]">
                            PROCESSING
                          </Badge>
                        </div>
                      </GlassCard>
                    )}

                    {/* Safe Stage */}
                    {isSafe && !isUnsafe && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#00ff9f]/5 border border-[#00ff9f]/25"
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#00ff9f]" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#00ff9f] uppercase">{STAGE_LABELS[stage]} — Verified Safe</p>
                          {result?.reason && <p className="text-[10px] text-white/50 mt-0.5">{result.reason}</p>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#00ff9f]/30" />
                      </motion.div>
                    )}

                    {/* Unsafe / Root Cause Stage */}
                    {isUnsafe && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#ff3b3b]/10 border border-[#ff3b3b]/30"
                      >
                        <XCircle className="w-6 h-6 text-[#ff3b3b]" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#ff3b3b] uppercase">{STAGE_LABELS[stage]} — Contaminated</p>
                          {result?.reason && <p className="text-[10px] text-white/50 mt-0.5">{result.reason}</p>}
                        </div>
                        <Badge variant="unsafe" className="ml-auto text-[8px]">ROOT CAUSE</Badge>
                      </motion.div>
                    )}

                    {/* Blocked Stage */}
                    {isBlocked && (
                      <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-black/40 border border-white/5 opacity-40">
                        <Ban className="w-6 h-6 text-gray-500" />
                        <p className="text-sm font-black text-gray-500 uppercase">{STAGE_LABELS[stage]} — Blocked</p>
                      </div>
                    )}

                    {/* Pending Stage */}
                    {isPending && (
                      <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white/[0.03] border border-white/5 opacity-30">
                        <Clock className="w-6 h-6 text-gray-600" />
                        <p className="text-sm font-black text-gray-600 uppercase">{STAGE_LABELS[stage]} — Pending</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RESULTS: AI PREDICTION + RISK ── */}
      <AnimatePresence>
        {hasData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* AI Prediction */}
            <GlassCard className={cn('p-8 flex flex-col justify-center items-center text-center space-y-4 border-2 transition-all duration-700',
              isCurSafe ? 'border-[#00ff9f]/30 bg-[#00ff9f]/5' : 'border-[#ff3b3b]/30 bg-[#ff3b3b]/5')}>
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-5 h-5 text-[#00cfff]" />
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">AI Prediction</h3>
              </div>
              <h2 className="text-6xl font-black uppercase italic" style={{ color: isCurSafe ? '#00ff9f' : '#ff3b3b' }}>
                {aiResult.status}
              </h2>
              <p className="text-sm font-bold text-white/70 max-w-[80%]">{aiResult.reason}</p>
            </GlassCard>

            {/* Risk Intelligence */}
            <GlassCard className="p-8 border-white/10 bg-white/[0.02] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#fffb00]" />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Risk Intelligence</h3>
                </div>
                <Badge variant={aiResult.risk === 'HIGH' ? 'unsafe' : aiResult.risk === 'MEDIUM' ? 'warning' : 'safe'}
                  className="px-4 py-1 text-[10px] font-black">
                  {aiResult.risk} RISK
                </Badge>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase">Last Stage</p>
                  <p className="text-xl font-black text-white uppercase italic">{selectedStage || '—'}</p>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase">Distributor</p>
                  <p className="text-xl font-black text-white uppercase italic truncate max-w-[60%]">
                    {distributorInfo.name || form.distributor || '—'}
                  </p>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase">Retailer</p>
                  <p className="text-xl font-black text-white uppercase italic truncate max-w-[60%]">
                    {retailerInfo?.name || form.retailer || '—'}
                  </p>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <p className="text-[10px] text-gray-500 font-black uppercase">Flow Decision</p>
                  <p className="text-xl font-black italic uppercase" style={{ color: glow }}>
                    {decision?.replace(/_/g, ' ') || '—'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SENSOR METRICS (after run) ── */}
      <AnimatePresence>
        {hasData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { label: 'TDS', value: tdsVal, unit: 'ppm', limit: limits.tds, over: tdsOver },
              { label: 'Color', value: colorVal, unit: 'unit', limit: limits.color, over: colorOver },
            ].map(({ label, value, unit, limit, over }) => (
              <GlassCard key={label} className="p-5 border-white/10 bg-white/[0.02]">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className={cn('text-2xl font-black', over ? 'text-[#ff3b3b]' : 'text-white')}>
                  {value} <span className="text-[10px] opacity-40">{unit}</span>
                </p>
                <p className="text-[8px] font-bold text-gray-600 mt-1">Limit {limit}</p>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

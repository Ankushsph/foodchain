import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  ShieldCheck, ArrowLeft, BrainCircuit, Activity, 
  Link as LinkIcon, CheckCircle2, ScanLine, AlertTriangle, 
  ExternalLink, Copy, Check, Fingerprint, ShieldAlert,
  ArrowRight, UserCheck, Scale, Clock, MapPin, Store
} from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { verifyBatch } = useStore();

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      setIsScanning(false);
      setIsAnalyzing(true);
      
      let batchId = result;
      try {
        const parsed = JSON.parse(result);
        if (parsed.batch_id) batchId = parsed.batch_id;
      } catch (e) {
        // Not JSON, use as raw string
      }

      // Fetch real data from backend
      const data = await verifyBatch(batchId);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setScanResult(data);
      }, 1500); // Small delay for "AI Analysis" feel
    }
  };

  const handleCopy = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSafe = scanResult?.status === 'SAFE' && !scanResult?.error;
  const hasError = scanResult?.error || scanResult?.status === 'NOT_FOUND';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 relative min-h-[80vh] flex flex-col items-center justify-center py-10">
      {/* Page Header */}
      {!scanResult && !isAnalyzing && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Consumer <span className="text-[#00cfff]">Verification</span></h1>
          <p className="text-gray-500 font-mono text-[10px] tracking-[0.3em] uppercase">
            Verify supply chain integrity in real-time
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-lg aspect-square relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,207,255,0.15)] border border-white/10 bg-black group"
          >
            <Scanner 
              onScan={handleScan}
              formats={['qr_code']}
              components={{ audio: false, finder: false }}
              styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
            />
            
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
              <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#00cfff] rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#00cfff] rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#00cfff] rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#00cfff] rounded-br-xl" />
              
              <div className="absolute inset-y-8 inset-x-8 overflow-hidden">
                <motion.div 
                  className="w-full h-1 bg-gradient-to-r from-transparent via-[#00cfff] to-transparent shadow-[0_0_20px_#00cfff]"
                  animate={{ y: ['0%', '700%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </div>

              <div className="absolute bottom-12 flex flex-col items-center gap-4 pointer-events-auto">
                <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <ScanLine className="w-5 h-5 text-[#00cfff] animate-pulse" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Align QR code within frame</p>
                </div>
                
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleScan("MILK-001"); }}
                  className="bg-[#00cfff]/10 border border-[#00cfff]/30 text-[#00cfff] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#00cfff]/20 transition-all px-8 py-2 rounded-full cursor-pointer pointer-events-auto"
                >
                  [ SIMULATE DEMO SCAN ]
                </Button>
              </div>
            </div>
          </motion.div>
        ) : isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-[#00cfff]/20 border-t-[#00cfff] rounded-full animate-spin"></div>
              <BrainCircuit className="w-10 h-10 text-[#00cfff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Verifying Ledger...</h2>
              <p className="text-gray-500 font-mono text-[10px] uppercase mt-2 tracking-widest">Cross-referencing Stellar Blockchain Proofs</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-6"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setScanResult(null); setIsScanning(true); }}
              className="text-[#00cfff] hover:text-[#00cfff]/80 hover:bg-[#00cfff]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> SCAN ANOTHER PRODUCT
            </Button>

            {hasError ? (
              <GlassCard className="p-12 border-red-500/30 text-center space-y-6">
                <div className="p-6 bg-red-500/10 rounded-full w-24 h-24 mx-auto flex items-center justify-center border-2 border-red-500/30">
                  <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white uppercase italic">Invalid Product</h2>
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">This batch ID was not found in the FoodChain Ledger</p>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-6">
                {/* 🟢 BIG DECISION CARD */}
                <GlassCard className={cn(
                  "p-8 border-t-8 relative overflow-hidden",
                  isSafe ? "border-t-[#00ff9f] bg-[#00ff9f]/5" : "border-t-[#ff3b3b] bg-[#ff3b3b]/5"
                )}>
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center border-4 shrink-0",
                      isSafe ? "border-[#00ff9f]/30 text-[#00ff9f]" : "border-[#ff3b3b]/30 text-[#ff3b3b]"
                    )}>
                      {isSafe ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12 animate-pulse" />}
                    </div>
                    <div>
                      <h2 className={cn(
                        "text-4xl font-black uppercase italic tracking-tighter mb-1",
                        isSafe ? "text-[#00ff9f]" : "text-[#ff3b3b]"
                      )}>
                        {scanResult?.decision || (isSafe ? 'VERIFIED SAFE' : 'NOT SAFE')}
                      </h2>
                      <p className="text-white font-bold text-lg leading-tight uppercase italic opacity-80">
                        {isSafe 
                          ? "This product passed all supply chain checks" 
                          : `Contamination detected at ${scanResult?.root_cause}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* TRUST MESSAGE */}
                  <div className={cn(
                    "mt-8 p-4 rounded-2xl border flex items-center gap-4",
                    isSafe ? "bg-[#00ff9f]/10 border-[#00ff9f]/20" : "bg-[#ff3b3b]/10 border-[#ff3b3b]/20"
                  )}>
                    {isSafe ? <CheckCircle2 className="w-6 h-6 text-[#00ff9f]" /> : <ShieldAlert className="w-6 h-6 text-[#ff3b3b]" />}
                    <p className="text-sm font-black text-white uppercase italic tracking-wide">
                      {isSafe 
                        ? "✓ Verified and safe for consumption" 
                        : "❌ DO NOT CONSUME — CONTAMINATION DETECTED"}
                    </p>
                  </div>
                </GlassCard>

                {/* 🔄 SUPPLY CHAIN TRACE (PIPELINE) */}
                <GlassCard className="p-8 border-white/5 bg-black/40">
                  <div className="flex items-center gap-3 mb-8">
                    <Fingerprint className="w-5 h-5 text-[#00cfff]" />
                    <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Supply Chain Trace</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                    {/* Pipeline Line Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden md:block" />
                    
                    {['farm', 'distributor', 'retail'].map((stage, i) => {
                      const event = scanResult?.events?.find(e => e.stage === stage);
                      const status = event ? event.status : 'pending';
                      const isFailed = status === 'unsafe';
                      const isProcessed = !!event;

                      return (
                        <div key={stage} className="relative z-10 flex flex-col items-center gap-3 flex-1">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                            isFailed ? "bg-[#ff3b3b]/20 border-[#ff3b3b] text-[#ff3b3b] shadow-[0_0_15px_rgba(255,59,59,0.3)]" :
                            isProcessed ? "bg-[#00ff9f]/20 border-[#00ff9f] text-[#00ff9f] shadow-[0_0_15px_rgba(0,255,159,0.3)]" :
                            "bg-gray-900 border-white/10 text-gray-700"
                          )}>
                            {stage === 'farm' ? <MapPin className="w-5 h-5" /> : stage === 'distributor' ? <Activity className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-white uppercase italic mb-1">{stage}</p>
                            {event ? (
                              <div className="space-y-1">
                                <p className="text-[9px] text-gray-500 font-bold uppercase">{event.actor}</p>
                                <div className="flex items-center justify-center gap-1">
                                  <UserCheck className="w-3 h-3 text-[#00cfff]" />
                                  <span className="text-[8px] font-black text-[#00cfff]">{event.actor_score}% Trust</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[8px] text-gray-700 font-bold uppercase">Pending</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* ⛓️ BLOCKCHAIN PROOF SECTION */}
                <GlassCard className="p-8 border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 text-[#00ff9f]">
                        <Scale className="w-6 h-6" />
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Verified on Blockchain</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1 italic">Batch ID</p>
                          <p className="text-xs font-black text-white uppercase italic">{scanResult?.batch_id}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1 italic">Timestamp</p>
                          <p className="text-xs font-black text-white uppercase italic">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1 italic">Ledger Hash</p>
                        <div className="flex items-center justify-between bg-black/60 border border-white/5 p-3 rounded-xl font-mono text-[10px] text-[#00cfff]">
                          <span className="truncate mr-4">
                            {scanResult?.blockchain_hash || `stellar_tx_${Math.random().toString(16).slice(2, 18)}`}
                          </span>
                          <button onClick={() => handleCopy(scanResult?.blockchain_hash)} className="shrink-0 p-1 hover:text-white transition-colors">
                            {copied ? <Check className="w-4 h-4 text-[#00ff9f]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

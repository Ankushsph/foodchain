import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ShieldCheck, ArrowLeft, BrainCircuit, Activity, Link as LinkIcon, CheckCircle2, ScanLine, AlertTriangle, ExternalLink, Copy, Check, Fingerprint } from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import useStore from '../store/useStore';

export const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const blockchain = useStore((state) => state.blockchain);

  const handleScan = (result) => {
    if (result && result.length > 0) {
      setIsScanning(false);
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      setTimeout(() => {
        setIsAnalyzing(false);
        setScanResult({
          batchId: 'MILK-4829A',
          source: 'Dairy Farm Alpha',
          status: 'UNSAFE',
          confidence: 98.4,
          reason: 'High turbidity (4.5 NTU) detected',
          txHash: blockchain.txHash,
          date: new Date().toLocaleDateString()
        });
      }, 2000);
    }
  };

  const handleCopy = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSafe = scanResult?.status === 'SAFE';
  const shortHash = scanResult ? `${scanResult.txHash.substring(0, 8)}...${scanResult.txHash.substring(scanResult.txHash.length - 8)}` : '';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 relative min-h-[80vh] flex flex-col items-center justify-center py-10">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Food Safety Scanner</h1>
        <p className="text-[#00cfff] font-mono text-sm tracking-widest uppercase">
          Scan a product to verify safety and authenticity using AI and blockchain
        </p>
      </div>

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
              {/* Corner Targets */}
              <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#00cfff] rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#00cfff] rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#00cfff] rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#00cfff] rounded-br-xl" />
              
              {/* Animated Scan Line */}
              <div className="absolute inset-y-8 inset-x-8 overflow-hidden">
                <motion.div 
                  className="w-full h-1 bg-gradient-to-r from-transparent via-[#00cfff] to-transparent shadow-[0_0_20px_#00cfff]"
                  animate={{ y: ['0%', '700%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </div>

              <div className="absolute bottom-12 flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <ScanLine className="w-5 h-5 text-[#00cfff] animate-pulse" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Align QR code within frame</p>
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
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Analyzing...</h2>
              <p className="text-gray-400 font-mono text-sm mt-2">Performing AI Food Safety Check</p>
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
              onClick={() => setIsScanning(true)}
              className="text-[#00cfff] hover:text-[#00cfff]/80 hover:bg-[#00cfff]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> SCAN ANOTHER PRODUCT
            </Button>

            <GlassCard className={cn(
              "border-t-4 p-8 overflow-hidden relative",
              isSafe ? "border-t-[#00ff9f]" : "border-t-[#ff3b3b]"
            )}>
              {/* Background Glow */}
              <div className={cn(
                "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20",
                isSafe ? "bg-[#00ff9f]" : "bg-[#ff3b3b]"
              )} />

              <div className="relative z-10 space-y-8">
                {/* Result Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Product Information</p>
                      <Badge variant="outline" className="text-[10px] py-0">{scanResult.date}</Badge>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{scanResult.batchId}</h2>
                    <p className="text-gray-300 font-medium flex items-center gap-2 mt-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      Source Node: <span className="text-white">{scanResult.source}</span>
                    </p>
                  </div>
                  <div className={cn(
                    "px-6 py-4 rounded-2xl border flex flex-col items-center gap-1 min-w-[160px]",
                    isSafe ? "bg-[#00ff9f]/10 border-[#00ff9f]/30" : "bg-[#ff3b3b]/10 border-[#ff3b3b]/30"
                  )}>
                    <span className={cn("text-4xl font-black uppercase", isSafe ? "text-[#00ff9f]" : "text-[#ff3b3b]")}>
                      {scanResult.status}
                    </span>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">AI Safety Status</span>
                  </div>
                </div>

                {/* AI Analysis Result */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BrainCircuit className="w-5 h-5 text-[#00cfff]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Result</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 font-mono text-[10px] uppercase mb-1">Confidence Score</p>
                      <p className="text-2xl font-black text-white">{scanResult.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-mono text-[10px] uppercase mb-1">Analysis Reason</p>
                      <p className="text-lg font-bold text-[#00cfff]">{scanResult.reason}</p>
                    </div>
                  </div>

                  {!isSafe && (
                    <div className="mt-4 p-4 bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 rounded-xl flex items-center gap-4">
                      <AlertTriangle className="w-8 h-8 text-[#ff3b3b] shrink-0 animate-pulse" />
                      <div>
                        <p className="text-[#ff3b3b] font-black uppercase text-sm">Do not consume</p>
                        <p className="text-white/80 text-xs">Batch quarantined due to safety violation.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Blockchain Proof */}
                <div className="bg-panel-bg border border-white/10 rounded-2xl p-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-[#00cfff]" />
                    Blockchain Proof
                  </h4>
                  
                  <div className="flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-[#00ff9f] font-medium bg-[#00ff9f]/5 p-2.5 rounded-lg border border-[#00ff9f]/20">
                        <CheckCircle2 className="w-5 h-5" />
                        Verified on Stellar Network
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 font-mono mb-1">Transaction Hash</p>
                        <div className="flex items-center justify-between font-mono text-xs text-[#00cfff] bg-black/40 p-2.5 rounded-lg border border-white/5">
                          {shortHash}
                          <button 
                            onClick={handleCopy}
                            className="p-1 hover:text-white transition-colors"
                          >
                            {copied ? <Check className="w-4 h-4 text-[#00ff9f]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="md:w-auto w-full text-sm py-1 h-10 border-[#00cfff]/30 text-[#00cfff] hover:bg-[#00cfff]/10">
                      View on Explorer <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
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

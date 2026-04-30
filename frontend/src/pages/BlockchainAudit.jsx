import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Link as LinkIcon, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  Clock, 
  MapPin, 
  AlertTriangle,
  History,
  Scale
} from 'lucide-react';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import useStore from '../store/useStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const BlockchainAudit = () => {
  const { verifyBatch } = useStore();
  const [searchId, setSearchId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [disputeData, setDisputeData] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const handleVerify = async () => {
    if (!searchId) return;
    setIsVerifying(true);
    const data = await verifyBatch(searchId);
    setDisputeData(data);
    setIsVerifying(false);
  };

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Blockchain <span className="text-[#00cfff]">Audit Trail</span>
          </h1>
          <p className="text-gray-500 mt-2 font-mono text-[10px] tracking-[0.3em] uppercase">
            Tamper-proof quality verification ledger
          </p>
        </div>
        <Badge variant="safe" className="px-6 py-2 text-[10px] font-black border-2 border-[#00ff9f]/30">
          ✓ NETWORK SECURE
        </Badge>
      </div>

      {/* ── DISPUTE VERIFICATION PANEL ── */}
      <GlassCard className="p-8 border-white/10 bg-white/[0.02]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3 text-white mb-2">
              <Scale className="w-6 h-6 text-[#7a5cff]" />
              <h3 className="text-xl font-black uppercase italic tracking-tight">Dispute Resolution</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-bold">
              Verify the immutable root cause of contamination. Use the Batch ID to pull the verified cryptographic timeline.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Enter Batch ID (e.g. MILK-001)"
                  className="w-full h-14 bg-black/60 border-2 border-white/10 rounded-xl pl-12 pr-4 text-white font-bold focus:border-[#7a5cff]/50 outline-none transition-all"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <Button 
                onClick={handleVerify}
                disabled={isVerifying || !searchId}
                className="w-full h-14 bg-[#7a5cff]/20 border-2 border-[#7a5cff]/40 text-[#7a5cff] font-black uppercase tracking-widest hover:bg-[#7a5cff]/30 transition-all"
              >
                {isVerifying ? 'Verifying Proof...' : 'Verify on Blockchain'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
            {!disputeData ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <History className="w-12 h-12 text-gray-500" />
                <p className="font-black text-xs uppercase tracking-widest text-gray-500">Awaiting Search...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Verified Verdict</h4>
                    <p className={cn(
                      "text-2xl font-black uppercase italic tracking-tighter",
                      disputeData.root_cause ? "text-[#ff3b3b]" : "text-[#00ff9f]"
                    )}>
                      {disputeData.verdict}
                    </p>
                  </div>
                  <Badge variant={disputeData.root_cause ? 'unsafe' : 'safe'}>
                    {disputeData.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Root Cause Stage</p>
                    <p className="text-sm font-black text-white uppercase italic">{disputeData.root_cause || 'None'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Checkpoints Verified</p>
                    <p className="text-sm font-black text-white uppercase italic">{disputeData.total_checkpoints} Stages</p>
                  </div>
                </div>
                
                {disputeData.events.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Immutable Proof Timeline</p>
                    <div className="space-y-3">
                      {disputeData.events.map((event, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            event.status === 'safe' ? "bg-[#00ff9f]/10 text-[#00ff9f]" : "bg-[#ff3b3b]/10 text-[#ff3b3b]"
                          )}>
                            {event.status === 'safe' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-black text-white uppercase italic">{event.stage}</p>
                              <p className="text-[8px] text-gray-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <p 
                              onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${event.event_hash}`, '_blank')}
                              className="text-[10px] text-[#00cfff] font-mono truncate cursor-pointer hover:underline"
                            >
                              {event.event_hash}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ── LIVE AUDIT FEED ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#00ff9f]" />
          <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Live Network Events</h3>
        </div>
        
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {/* Recent Audit events could be pulled from store if needed */}
          {!disputeData?.events?.length && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
              <LinkIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No verified events in current session</p>
            </div>
          )}
          
          {disputeData?.events.map((event, idx) => (
            <motion.div key={idx} variants={item}>
              <GlassCard className={cn(
                "p-6 border-l-4 overflow-hidden relative",
                event.status === 'safe' ? "border-l-[#00ff9f] bg-[#00ff9f]/5" : "border-l-[#ff3b3b] bg-[#ff3b3b]/5"
              )}>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="flex items-center gap-6 flex-1">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg",
                      event.status === 'safe' ? "border-[#00ff9f]/30 text-[#00ff9f]" : "border-[#ff3b3b]/30 text-[#ff3b3b]"
                    )}>
                      {event.status === 'safe' ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 animate-pulse" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{event.stage} Checkpoint</h4>
                        <Badge variant={event.status === 'safe' ? 'safe' : 'unsafe'} className="px-2 py-0.5 text-[8px]">
                          {event.status === 'safe' ? 'VERIFIED' : 'COMPROMISED'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Actor: <span className="text-white ml-1">{event.actor}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time: <span className="text-white ml-1">{new Date(event.timestamp).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-72 space-y-2">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 italic">Event Proof Hash</p>
                    <div className="flex items-center justify-between bg-black/60 border border-white/5 p-2 rounded-lg font-mono text-[9px] text-[#00cfff]">
                      <span className="truncate mr-4">{event.event_hash}</span>
                      <button onClick={() => handleCopy(event.event_hash)} className="shrink-0 p-1 hover:text-white">
                        {copiedHash === event.event_hash ? <Check className="w-3 h-3 text-[#00ff9f]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

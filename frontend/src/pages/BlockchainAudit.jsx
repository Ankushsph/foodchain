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
  const { verifyBatch, batchHistory } = useStore();
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
            ) : disputeData.error ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-[#ff3b3b] animate-pulse" />
                <p className="font-black text-xs uppercase tracking-widest text-[#ff3b3b] italic">{disputeData.error}</p>
                <p className="text-[10px] text-gray-500 font-bold">Please check the Batch ID and try again.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Verified Verdict</h4>
                    <p className={cn(
                      "text-2xl font-black uppercase italic tracking-tighter",
                      disputeData?.root_cause ? "text-[#ff3b3b]" : "text-[#00ff9f]"
                    )}>
                      {disputeData?.verdict || 'Processing...'}
                    </p>
                  </div>
                  <Badge variant={disputeData?.root_cause ? 'unsafe' : 'safe'}>
                    {disputeData?.status || 'UNKNOWN'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Root Cause Stage</p>
                    <p className="text-sm font-black text-white uppercase italic">{disputeData?.root_cause || 'None'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Checkpoints Verified</p>
                    <p className="text-sm font-black text-white uppercase italic">{disputeData?.total_checkpoints || 0} Stages</p>
                  </div>
                </div>
                
                {disputeData?.events && Array.isArray(disputeData.events) && disputeData.events.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Immutable Proof Timeline</p>
                    <div className="space-y-3">
                      {['farm', 'distributor', 'retail'].map((stageId, i) => {
                        const event = disputeData.events?.find(e => e?.stage === stageId);
                        const isRootCause = disputeData?.root_cause === stageId;
                        const upstreamFailed = disputeData?.root_cause && 
                          ['farm', 'distributor', 'retail'].indexOf(stageId) > ['farm', 'distributor', 'retail'].indexOf(disputeData.root_cause);
                        
                        if (!event && !upstreamFailed) return null;

                        return (
                          <div key={stageId} className={cn(
                            "flex items-center gap-4 bg-white/5 p-4 rounded-xl border relative transition-all",
                            isRootCause ? "border-[#ff3b3b] bg-[#ff3b3b]/10 shadow-[0_0_20px_rgba(255,59,59,0.2)]" : "border-white/5",
                            upstreamFailed && "opacity-40 grayscale"
                          )}>
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2",
                              upstreamFailed ? "bg-gray-800/50 border-gray-700 text-gray-500" :
                              event?.status === 'safe' ? "bg-[#00ff9f]/10 border-[#00ff9f]/30 text-[#00ff9f]" : "bg-[#ff3b3b]/10 border-[#ff3b3b]/30 text-[#ff3b3b]"
                            )}>
                              {upstreamFailed ? <Clock className="w-5 h-5" /> :
                               event?.status === 'safe' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 pulse" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-black text-white uppercase italic tracking-tight">{stageId}</p>
                                  {isRootCause && <Badge variant="unsafe" className="text-[8px] px-2 py-0">ROOT CAUSE</Badge>}
                                  {upstreamFailed && <Badge variant="outline" className="text-[8px] px-2 py-0 border-gray-600 text-gray-500">BLOCKED</Badge>}
                                </div>
                                <p className="text-[9px] text-gray-500 font-mono">
                                  {event?.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'N/A'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] text-gray-400 font-bold truncate">
                                  {upstreamFailed ? "Upstream contamination detected" : 
                                   event ? `Actor: ${event.actor || 'Unknown'}` : "Pending Verification"}
                                </p>
                                {event?.event_hash && (
                                  <p className="text-[8px] text-[#00cfff] font-mono truncate max-w-[100px] ml-4">
                                    {event.event_hash.slice(0, 12)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── DISPUTE PROOF MESSAGE (If Unsafe) ── */}
                {disputeData?.root_cause && (
                  <div className="mt-6 p-4 rounded-xl bg-[#ff3b3b]/5 border border-[#ff3b3b]/20">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-[#ff3b3b] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-white font-bold leading-tight">
                          <span className="text-[#ff3b3b] uppercase mr-1">Dispute Proof:</span>
                          {disputeData?.responsible_actor || 'An actor'} recorded this batch as unsafe. This record is cryptographically secured via hash <span className="font-mono text-[#00cfff]">{disputeData.events?.find(e => e.stage === disputeData.root_cause)?.event_hash?.slice(0, 8) || 'N/A'}</span> and cannot be altered.
                        </p>
                      </div>
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
          {/* Recent Audit events pulled from global session store */}
          {batchHistory.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
              <LinkIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No verified events in current session</p>
            </div>
          )}
          
          {batchHistory.slice().reverse().map((event, idx) => (
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
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">
                          {event.batch_id || 'UNKNOWN'} — {event.stage} Checkpoint
                        </h4>
                        <Badge variant={event.status === 'safe' ? 'safe' : 'unsafe'} className="px-2 py-0.5 text-[8px]">
                          {event.status === 'safe' ? 'VERIFIED' : 'COMPROMISED'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Actor: <span className="text-white ml-1">{event.actor}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time: <span className="text-white ml-1">{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'JUST NOW'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-72 space-y-3">
                    <div>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 italic">Event Audit Hash</p>
                      <div className="flex items-center justify-between bg-black/60 border border-white/5 p-2 rounded-lg font-mono text-[8px] text-[#00cfff]">
                        <span className="truncate mr-4">{event.event_hash || 'PENDING...'}</span>
                        <button onClick={() => handleCopy(event.event_hash)} className="shrink-0 p-1 hover:text-white">
                          {copiedHash === event.event_hash ? <Check className="w-3 h-3 text-[#00ff9f]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    {event.blockchain_hash && (
                      <div>
                        <p className="text-[8px] text-[#00ff9f] font-black uppercase tracking-[0.2em] mb-1 italic">Stellar Ledger Hash</p>
                        <div className="flex items-center justify-between bg-black/60 border border-[#00ff9f]/20 p-2 rounded-lg font-mono text-[8px] text-[#00ff9f]">
                          <span className="truncate mr-4">{event.blockchain_hash}</span>
                          <button onClick={() => handleCopy(event.blockchain_hash)} className="shrink-0 p-1 hover:text-[#00ff9f]">
                            {copiedHash === event.blockchain_hash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
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

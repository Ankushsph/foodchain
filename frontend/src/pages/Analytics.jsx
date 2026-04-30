import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard, cn } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { 
  TrendingUp, Activity, ShieldAlert, BrainCircuit, 
  AlertTriangle, Package, Percent, ShieldCheck, 
  UserCheck, ShieldX, Wallet, Zap, Ban, Leaf, Truck, Store
} from 'lucide-react';
import useStore from '../store/useStore';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel-bg backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <p className="text-white font-bold mb-3 border-b border-white/10 pb-2 uppercase tracking-widest text-xs">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1">
            <span className="text-gray-400 font-mono text-xs uppercase">{entry.name}</span>
            <span style={{ color: entry.color || entry.fill }} className="font-bold drop-shadow-[0_0_5px_currentColor]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SummaryCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    <GlassCard className="flex items-center gap-4 p-6 border-white/5 hover:border-white/20">
      <div className={cn("p-3 rounded-xl border flex items-center justify-center", colorClass.bg, colorClass.border, colorClass.text)}>
        <Icon className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
      </div>
      <div>
        <p className="text-gray-400 font-mono text-[10px] uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </GlassCard>
  </motion.div>
);

const LeaderboardTable = ({ title, data, type }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest italic">{title}</h4>
    <div className="space-y-3">
      {data.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-40">
          <p className="text-xs font-bold uppercase tracking-widest">No active {type}s</p>
        </div>
      ) : (
        data.map((item, idx) => (
          <div key={idx} className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all",
            item.status === 'BLACKLISTED' ? "bg-[#ff3b3b]/5 border-[#ff3b3b]/20 opacity-60" : "bg-white/5 border-white/5 hover:border-white/20"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs italic",
                idx === 0 ? "bg-[#fffb00] text-black shadow-[0_0_15px_rgba(255,251,0,0.4)]" : "bg-white/10 text-white"
              )}>
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase italic tracking-tight">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Wallet className="w-3 h-3 text-gray-500" />
                  <p className="text-[9px] font-mono text-gray-500 truncate max-w-[80px]">{item.wallet}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-lg font-black italic",
                item.score >= 70 ? "text-[#00ff9f]" : item.score >= 30 ? "text-[#fffb00]" : "text-[#ff3b3b]"
              )}>{item.score}%</p>
              <Badge variant={item.status === 'TRUSTED' ? 'safe' : item.status === 'WARNING' ? 'outline' : 'unsafe'} className="text-[8px] px-2">
                {item.status}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const Analytics = () => {
  const analytics = useStore((state) => state.analytics);
  const fetchAnalytics = useStore((state) => state.fetchAnalytics);
  const isLoading = useStore((state) => state.isAnalyticsLoading);

  useEffect(() => {
    fetchAnalytics();
    const id = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(id);
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="w-12 h-12 text-[#00cfff] animate-pulse" />
        <p className="text-[10px] font-black text-[#00cfff] uppercase tracking-[0.4em] animate-pulse">Syncing Intelligence Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Supplier <span className="text-[#00cfff]">Intelligence</span>
          </h1>
          <p className="text-gray-500 mt-2 font-mono text-[10px] tracking-[0.3em] uppercase">
            Real-time reputation & risk prediction dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#00cfff]/10 border border-[#00cfff]/30 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-[#00cfff] animate-pulse" />
          <span className="text-[10px] font-black text-[#00cfff] uppercase tracking-widest">Live Engine Active</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <GlassCard className="p-8 border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#00cfff]/10 rounded-2xl border border-[#00cfff]/30 group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-[#00cfff]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Total Batches</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{analytics.stats.total}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#ff3b3b]/10 rounded-2xl border border-[#ff3b3b]/30 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-8 h-8 text-[#ff3b3b]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Unsafe Batches</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{analytics.stats.unsafe}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-[#00ff9f]/10 rounded-2xl border border-[#00ff9f]/30 group-hover:scale-110 transition-transform">
              <Percent className="w-8 h-8 text-[#00ff9f]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Risk Percentage</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{analytics.stats.risk_pct}%</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Blacklist Registry */}
        <GlassCard className="p-8 border-white/10 hover:border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ff3b3b]/10 rounded-xl border border-[#ff3b3b]/30">
                <Ban className="w-6 h-6 text-[#ff3b3b]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Blacklist Registry</h3>
            </div>
          </div>
          <div className="space-y-4">
            {analytics.blacklisted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-40">
                <ShieldCheck className="w-16 h-16 text-[#00ff9f] mb-4" />
                <p className="text-sm font-black text-white uppercase tracking-widest italic">No Blacklisted Actors Detected</p>
              </div>
            ) : (
              analytics.blacklisted.map((actor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-[#ff3b3b]/20 rounded-2xl hover:border-[#ff3b3b]/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#ff3b3b]/10 flex items-center justify-center text-[#ff3b3b] font-black">
                      !
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic">{actor.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{actor.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#ff3b3b] italic">BLOCKED</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Score: {actor.score}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Trend Intelligence */}
        <GlassCard className="p-8 border-white/10 hover:border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl border",
                analytics.stats.current_status === 'SAFE' ? "bg-[#00ff9f]/10 border-[#00ff9f]/30" : "bg-[#ff3b3b]/10 border-[#ff3b3b]/30"
              )}>
                <Activity className={cn(
                  "w-6 h-6",
                  analytics.stats.current_status === 'SAFE' ? "text-[#00ff9f]" : "text-[#ff3b3b]"
                )} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Batch Health Trend</h3>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Last 5 Batches</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trends}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={analytics.stats.current_status === 'SAFE' ? "#00ff9f" : "#ff3b3b"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={analytics.stats.current_status === 'SAFE' ? "#00ff9f" : "#ff3b3b"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 1]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="unsafe" 
                  stroke={analytics.stats.current_status === 'SAFE' ? "#00ff9f" : "#ff3b3b"} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Farmers */}
        <GlassCard className="p-8 border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#00ff9f]/10 rounded-xl border border-[#00ff9f]/30">
              <Leaf className="w-6 h-6 text-[#00ff9f]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Top Farmers</h3>
          </div>
          <div className="space-y-4">
            {analytics.farmers.slice(0, 3).map((farmer, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic">{farmer.name}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{farmer.wallet?.slice(0, 10)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#00ff9f] italic">{farmer.score}%</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{farmer.status}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Distributors */}
        <GlassCard className="p-8 border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#00cfff]/10 rounded-xl border border-[#00cfff]/30">
              <Truck className="w-6 h-6 text-[#00cfff]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Top Distributors</h3>
          </div>
          <div className="space-y-4">
            {analytics.distributors.slice(0, 3).map((dist, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic">{dist.name}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{dist.wallet?.slice(0, 10)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#00cfff] italic">{dist.score}%</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{dist.status}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Retailers */}
        <GlassCard className="p-8 border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#a855f7]/10 rounded-xl border border-[#a855f7]/30">
              <Store className="w-6 h-6 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Top Retailers</h3>
          </div>
          <div className="space-y-4">
            {analytics.retailers.slice(0, 3).map((ret, idx) => (
              <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic">{ret.name}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{ret.wallet?.slice(0, 10)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#a855f7] italic">{ret.score}%</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{ret.status}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

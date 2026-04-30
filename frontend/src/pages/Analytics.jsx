import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../components/ui/GlassCard';
import { TrendingUp, BarChart3, Activity, ShieldAlert, BrainCircuit, AlertTriangle, Package, Percent } from 'lucide-react';

const trendData = [
  { name: 'Mon', unsafe: 2, safetyScore: 98 },
  { name: 'Tue', unsafe: 5, safetyScore: 92 },
  { name: 'Wed', unsafe: 12, safetyScore: 84 },
  { name: 'Thu', unsafe: 3, safetyScore: 96 },
  { name: 'Fri', unsafe: 8, safetyScore: 89 },
  { name: 'Sat', unsafe: 15, safetyScore: 78 },
  { name: 'Sun', unsafe: 18, safetyScore: 75 }, // Realistic variation showing increasing trend
];

const supplierData = [
  { name: 'Farm A', score: 98, risk: 'low' },
  { name: 'Farm B', score: 95, risk: 'low' },
  { name: 'Dist C', score: 82, risk: 'medium' },
  { name: 'Dist D', score: 45, risk: 'high' },
  { name: 'Retail E', score: 90, risk: 'low' },
];

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

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <GlassCard className="flex items-center gap-4 p-6 border-white/5 hover:border-white/20">
      <div className={cn("p-3 rounded-xl border flex items-center justify-center", colorClass.bg, colorClass.border, colorClass.text)}>
        <Icon className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
      </div>
      <div>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </GlassCard>
  </motion.div>
);

export const Analytics = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          Food Safety Insights & Trends
        </h1>
        <p className="text-[#00cfff] mt-2 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
          <Activity className="w-4 h-4" /> AI-driven analysis of contamination patterns and supplier risk
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Batches" 
          value="1,248" 
          icon={Package} 
          colorClass={{ bg: 'bg-[#00cfff]/10', border: 'border-[#00cfff]/30', text: 'text-[#00cfff]' }}
          delay={0}
        />
        <SummaryCard 
          title="Unsafe Batches" 
          value="63" 
          icon={AlertTriangle} 
          colorClass={{ bg: 'bg-[#ff3b3b]/10', border: 'border-[#ff3b3b]/30', text: 'text-[#ff3b3b]' }}
          delay={0.1}
        />
        <SummaryCard 
          title="Risk Percentage" 
          value="5.04%" 
          icon={Percent} 
          colorClass={{ bg: 'bg-[#fffb00]/10', border: 'border-[#fffb00]/30', text: 'text-[#fffb00]' }}
          delay={0.2}
        />
        <SummaryCard 
          title="Active Alerts" 
          value="12" 
          icon={ShieldAlert} 
          colorClass={{ bg: 'bg-[#ff3b3b]/20', border: 'border-[#ff3b3b]/50', text: 'text-[#ff3b3b]' }}
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Risk Insights (Dominant) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <GlassCard className="border-[#00cfff]/40 shadow-[0_0_40px_rgba(0,207,255,0.1)] relative overflow-hidden p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00cfff]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="p-6 bg-[#00cfff]/10 rounded-2xl border border-[#00cfff]/30 shrink-0">
                <BrainCircuit className="w-16 h-16 text-[#00cfff] animate-pulse drop-shadow-[0_0_15px_#00cfff]" />
              </div>
              
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-wide">AI Risk Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-[#ff3b3b]/30">
                    <p className="text-gray-400 font-mono text-xs uppercase mb-2">Highest Risk Supplier</p>
                    <p className="text-white font-bold">Distributor D has highest contamination rate</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-[#fffb00]/30">
                    <p className="text-gray-400 font-mono text-xs uppercase mb-2">Trend Insight</p>
                    <p className="text-white font-bold">Contamination risk increased in last 3 days</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-[#ff3b3b]/50 shadow-[inset_0_0_20px_rgba(255,59,59,0.1)]">
                    <p className="text-gray-400 font-mono text-xs uppercase mb-2">Prediction</p>
                    <p className="text-[#ff3b3b] font-black uppercase">High probability of contamination in next batch</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Chart 1: Contamination Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-[400px] relative overflow-hidden group border-white/10 hover:border-white/20 flex flex-col">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-[#ff3b3b] drop-shadow-[0_0_8px_#ff3b3b]" />
                Contamination Trends Over Time
              </h3>
              <p className="text-[10px] font-bold text-[#ff3b3b] bg-[#ff3b3b]/10 border border-[#ff3b3b]/20 px-2 py-1 rounded-full">
                Unsafe batches increased by 35% this week
              </p>
            </div>
            
            <div className="flex-1 w-full relative z-10 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorUnsafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3b3b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff3b3b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00cfff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00cfff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="safetyScore" 
                    name="Food Safety Score" 
                    stroke="#00cfff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSafety)" 
                    activeDot={{ r: 4, fill: '#00cfff', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="unsafe" 
                    name="Unsafe Batches" 
                    stroke="#ff3b3b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUnsafe)" 
                    activeDot={{ r: 6, fill: '#ff3b3b', stroke: '#fff', strokeWidth: 2, shadow: '0 0 10px #ff3b3b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Chart 2: Supplier Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1"
        >
          <GlassCard className="h-[400px] relative overflow-hidden group border-white/10 hover:border-white/20 flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10 text-white">
              <BarChart3 className="w-5 h-5 text-[#fffb00] drop-shadow-[0_0_8px_#fffb00]" />
              Supplier Risk Analysis
            </h3>
            
            <div className="flex-1 w-full relative z-10 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.8)" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 11}} axisLine={false} tickLine={false} width={60} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="score" 
                    name="Trust Score" 
                    radius={[0, 4, 4, 0]} 
                    animationDuration={1500}
                    barSize={20}
                  >
                    {supplierData.map((entry, index) => {
                      let color = '#00ff9f'; // low
                      if (entry.risk === 'medium') color = '#fffb00';
                      if (entry.risk === 'high') color = '#ff3b3b';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend for Bar Chart */}
            <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4 text-[10px] uppercase font-bold tracking-widest">
              <div className="flex items-center gap-1.5 text-[#00ff9f]"><span className="w-2 h-2 rounded-full bg-[#00ff9f]"></span> Safe</div>
              <div className="flex items-center gap-1.5 text-[#fffb00]"><span className="w-2 h-2 rounded-full bg-[#fffb00]"></span> Warn</div>
              <div className="flex items-center gap-1.5 text-[#ff3b3b]"><span className="w-2 h-2 rounded-full bg-[#ff3b3b]"></span> High Risk</div>
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
};

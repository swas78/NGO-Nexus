"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Users, Clock, Package, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CardSkeleton, KPIChartSkeleton } from "@/components/shared/SkeletonLoading";
import { fetchNeeds, fetchVolunteers } from "@/app/actions/supabase";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { Need, Volunteer } from "@/types";

const CHART_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun"];

function buildImpactTimeline(needs: Need[]) {
  return CHART_MONTHS.map((month, i) => ({
    month,
    peopleHelped: Math.round(needs.length * (i + 1) * 8.4),
    resourcesDelivered: Math.round(needs.reduce((a,n)=>a+n.fulfilledQuantity,0) * (i+1) * 0.18),
    volunteersDeployed: Math.round(Math.random() * 30 + 10),
  }));
}

function buildVolunteerPerf(volunteers: Volunteer[]) {
  return volunteers.slice(0, 8).map(v => ({
    name: v.name.split(" ")[0],
    missions: v.missionsCompleted,
    hours: v.totalHours,
    rating: v.rating,
  }));
}

const CAT_COLORS: Record<string,string> = {
  medical:"#ef4444", food:"#f97316", shelter:"#eab308",
  water:"#06b6d4", education:"#8b5cf6", clothing:"#ec4899",
  transport:"#3b82f6", other:"#6b7280"
};

const CustomTooltip = ({ active, payload, label }: { active?:boolean; payload?:{color:string;name:string;value:number}[]; label?:string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-dropdown p-3 !rounded-lg border border-white/10 bg-[#0a0a0f]/90">
      <p className="text-xs font-medium text-white/80 mb-2">{label}</p>
      {payload.map((e,i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5" style={{color:e.color}}>
            <div className="w-2 h-2 rounded-full" style={{backgroundColor:e.color}} />{e.name}
          </span>
          <span className="text-white">{e.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ImpactPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchNeeds(), fetchVolunteers()])
      .then(([n,v]) => { setNeeds(n); setVolunteers(v); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => {
    const peopleHelped = needs.reduce((a,n) => a + (n.fulfilledQuantity||0) * 4, 0);
    const fulfilled = needs.filter(n => n.status==="fulfilled").length;
    const fulfillRate = needs.length ? Math.round((fulfilled/needs.length)*100) : 0;
    const resourcesOut = needs.reduce((a,n) => a + (n.fulfilledQuantity||0), 0);
    const avgHours = volunteers.length ? Math.round(volunteers.reduce((a,v)=>a+v.totalHours,0)/volunteers.length) : 0;
    const volEfficiency = volunteers.length ? Math.round(volunteers.reduce((a,v)=>a+(v.missionsCompleted/Math.max(v.totalHours,1)*10),0)/volunteers.length*10) : 0;
    return { peopleHelped, fulfillRate, resourcesOut, avgHours, volEfficiency, fulfilled };
  }, [needs, volunteers]);

  const categoryData = useMemo(() => {
    const map = new Map<string,number>();
    needs.forEach(n => map.set(n.category, (map.get(n.category)||0) + n.fulfilledQuantity));
    return Array.from(map).map(([name,value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value, color: CAT_COLORS[name]||"#6b7280" }));
  }, [needs]);

  const impactTimeline = useMemo(() => buildImpactTimeline(needs), [needs]);
  const volPerf = useMemo(() => buildVolunteerPerf(volunteers), [volunteers]);

  const kpiCards = [
    { label:"People Helped", value:kpis.peopleHelped, suffix:"", trend:14.2, icon:<Heart className="w-5 h-5"/>, color:"text-rose-400", bg:"bg-rose-500/10" },
    { label:"Needs Fulfilled", value:kpis.fulfillRate, suffix:"%", trend:8.7, icon:<Target className="w-5 h-5"/>, color:"text-emerald-400", bg:"bg-emerald-500/10" },
    { label:"Resources Distributed", value:kpis.resourcesOut, suffix:"", trend:22.1, icon:<Package className="w-5 h-5"/>, color:"text-ngo-400", bg:"bg-ngo-500/10" },
    { label:"Avg Response Time", value:kpis.avgHours, suffix:"h", trend:-18.5, icon:<Clock className="w-5 h-5"/>, color:"text-amber-400", bg:"bg-amber-500/10" },
    { label:"Volunteer Efficiency", value:kpis.volEfficiency, suffix:"%", trend:5.3, icon:<Zap className="w-5 h-5"/>, color:"text-purple-400", bg:"bg-purple-500/10" },
    { label:"Active Volunteers", value:volunteers.filter(v=>v.availability!=="offline").length, suffix:"", trend:11.0, icon:<Users className="w-5 h-5"/>, color:"text-blue-400", bg:"bg-blue-500/10" },
  ];

  if (loading) return (
    <PageTransition>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">{[1,2,3,4,5,6].map(i=><CardSkeleton key={i}/>)}</div>
        <div className="grid lg:grid-cols-2 gap-6"><KPIChartSkeleton className="min-h-[280px]"/><KPIChartSkeleton className="min-h-[280px]"/></div>
        <div className="grid lg:grid-cols-3 gap-6"><KPIChartSkeleton className="lg:col-span-2 min-h-[260px]"/><KPIChartSkeleton className="min-h-[260px]"/></div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
          <h2 className="text-xl font-bold text-white/90">Impact Dashboard</h2>
          <p className="text-sm text-white/40 mt-1">Real-time impact metrics across all operations</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((card,i) => (
            <motion.div key={card.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08,duration:0.4}}>
              <GlassCard className="p-4 relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${card.bg} blur-xl opacity-60 group-hover:opacity-100 transition-opacity`}/>
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.bg} ${card.color} border border-white/5`}>{card.icon}</div>
                  <div className="text-2xl font-bold text-white mb-0.5"><AnimatedCounter target={card.value} suffix={card.suffix}/></div>
                  <div className="text-[10px] text-white/35 uppercase tracking-wider mb-1">{card.label}</div>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold ${card.trend>0?"text-emerald-400":"text-red-400"}`}>
                    {card.trend>0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}{Math.abs(card.trend)}%
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white/70">Impact Over Time</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={impactTimeline}>
                  <defs>
                    <linearGradient id="gPeople" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gResources" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="peopleHelped" stroke="#f43f5e" strokeWidth={2} fill="url(#gPeople)" name="People Helped"/>
                  <Area type="monotone" dataKey="resourcesDelivered" stroke="#10b981" strokeWidth={2} fill="url(#gResources)" name="Resources"/>
                  <Legend wrapperStyle={{fontSize:12,color:"rgba(255,255,255,0.5)",paddingTop:"16px"}} iconType="circle"/>
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white/70">Resources by Category</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30">Distributed</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {categoryData.map((e,i)=><Cell key={i} fill={e.color} fillOpacity={0.9}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:11,color:"rgba(255,255,255,0.5)",paddingTop:"12px"}} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="lg:col-span-2">
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white/70">Volunteer Performance</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30">Top 8</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volPerf} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="missions" name="Missions" fill="#8b5cf6" fillOpacity={0.85} radius={[4,4,0,0]}/>
                  <Bar dataKey="hours" name="Hours" fill="#3b82f6" fillOpacity={0.85} radius={[4,4,0,0]}/>
                  <Legend wrapperStyle={{fontSize:12,color:"rgba(255,255,255,0.5)",paddingTop:"16px"}} iconType="circle"/>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
            <GlassCard className="p-6 h-full" hover={false}>
              <h3 className="text-sm font-semibold text-white/70 mb-5">Response Time Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={CHART_MONTHS.map((m,i)=>({month:m, hours: Math.max(2, 24 - i*3 + Math.round(Math.random()*4))}))}>
                  <defs>
                    <linearGradient id="gRT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={2} fill="url(#gRT)" name="Avg Hours"/>
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

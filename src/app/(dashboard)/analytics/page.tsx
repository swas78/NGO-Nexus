"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { MOCK_ANALYTICS } from "@/lib/constants";
import { TrendingUp, TrendingDown, Clock, Heart, Users, CheckCircle2, Sparkles, Lightbulb, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { fetchNeeds, fetchVolunteers } from "@/app/actions/supabase";
import type { Need, Volunteer } from "@/types";
import { CardSkeleton, KPIChartSkeleton } from "@/components/shared/SkeletonLoading";



interface TooltipEntry {
  color: string;
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-dropdown p-3 !rounded-lg border border-white/10 shadow-xl backdrop-blur-xl bg-[#0a0a0f]/90">
      <p className="text-xs font-medium text-white/80 mb-2">{label}</p>
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [n, v] = await Promise.all([fetchNeeds(), fetchVolunteers()]);
        setNeeds(n);
        setVolunteers(v);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalNeeds = needs.length;
    const resolvedNeeds = needs.filter(n => n.status === "fulfilled" || n.fulfilledQuantity >= n.quantity).length;
    const activeVolunteers = volunteers.filter(v => v.availability === "available" || v.availability === "busy").length;
    
    // Calculate category distribution dynamically
    const categoryColors: Record<string, string> = {
      medical: "#ef4444", food: "#f97316", shelter: "#eab308",
      rescue: "#3b82f6", water: "#06b6d4"
    };
    
    const catMap = new Map<string, number>();
    needs.forEach(n => {
      const cat = n.category.toLowerCase();
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    
    const resourcesByCategory = Array.from(catMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: categoryColors[name] || "#8b5cf6"
    })).sort((a, b) => b.value - a.value);

    // Calculate urgency distribution dynamically
    const urgencyColors: Record<string, string> = {
      critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#10b981"
    };
    const urgMap = new Map<string, number>();
    needs.forEach(n => {
      urgMap.set(n.urgency, (urgMap.get(n.urgency) || 0) + 1);
    });

    const needsByUrgency = ["critical", "high", "medium", "low"]
      .filter(u => urgMap.has(u))
      .map(u => ({
        name: u.charAt(0).toUpperCase() + u.slice(1),
        value: urgMap.get(u) || 0,
        color: urgencyColors[u]
      }));

    return { totalNeeds, resolvedNeeds, activeVolunteers, resourcesByCategory, needsByUrgency };
  }, [needs, volunteers]);

  const metricCards = [
    { label: "Total Needs", value: stats.totalNeeds, suffix: "", trend: 12.5, icon: <Heart className="w-5 h-5" />, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Resolved Needs", value: stats.resolvedNeeds, suffix: "", trend: 18.2, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Volunteers", value: stats.activeVolunteers, suffix: "", trend: 8.3, icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg Response Time", value: 18, suffix: "hrs", trend: -15.2, icon: <Clock className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="w-48 h-6 rounded skeleton mb-2" />
              <div className="w-64 h-4 rounded skeleton" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
          <KPIChartSkeleton className="min-h-[150px]" />
          <div className="grid lg:grid-cols-2 gap-6">
            <KPIChartSkeleton className="min-h-[300px]" />
            <KPIChartSkeleton className="min-h-[300px]" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/90">Advanced Analytics</h2>
            <p className="text-sm text-white/40 mt-1">Real-time performance metrics and AI insights</p>
          </div>
        </div>

        {/* ═══════ KPI CARDS ═══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <GlassCard className="p-5 relative overflow-hidden group">
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color} border border-white/5`}>{card.icon}</div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/[0.03] border border-white/5 ${card.trend > 0 ? "text-emerald-400" : "text-emerald-400"}`}>
                      {card.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {Math.abs(card.trend)}%
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                    <AnimatedCounter target={card.value} suffix={card.suffix} />
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wider font-medium">{card.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* ═══════ AI INSIGHTS PANEL ═══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-ngo-500/30 via-purple-500/30 to-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-ngo-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
            <div className="relative bg-[#0a0a0f] rounded-2xl p-6 h-full flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-widest mb-4 w-max">
                  <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-2">Nexus Synthesis</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Our intelligence layer has analyzed {stats.totalNeeds * 12 + stats.activeVolunteers * 8} data points across your dashboard to generate these actionable insights.
                </p>
              </div>

              <div className="lg:w-2/3 grid sm:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-2 text-amber-400 mb-3"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Hotspot Alert</span></div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">Critical shortage of <span className="text-amber-400">Medical Supplies</span> detected in Eastern District. Predict 45% spike in next 48hrs.</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3"><TrendingUp className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Trend Summary</span></div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">Volunteer engagement is up <span className="text-emerald-400">12%</span> week-over-week. Average resolution time dropped by 2.4 hours.</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-2 text-blue-400 mb-3"><Lightbulb className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Recommendation</span></div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">Deploy 5 dormant volunteers from North Zone to Central Zone to balance the active resource distribution.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ CHARTS ROW 1 ═══════ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Assignment Trends (Monthly Overview) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/70">Assignment Trends</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Last 6 Months</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MOCK_ANALYTICS.monthlyOverview}>
                  <defs>
                    <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="needs" stroke="#f43f5e" strokeWidth={2} fill="url(#colorNeeds)" name="Total Needs" />
                  <Area type="monotone" dataKey="fulfilled" stroke="#10b981" strokeWidth={2} fill="url(#colorFulfilled)" name="Resolved Needs" />
                  <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: "20px" }} iconType="circle" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Needs by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/70">Needs by Category</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Live Distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.resourcesByCategory} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="value" name="Total Needs" radius={[4, 4, 0, 0]}>
                    {stats.resourcesByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* ═══════ CHARTS ROW 2 ═══════ */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Volunteer Utilization */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="lg:col-span-2">
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/70">Volunteer Utilization</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Growth Matrix</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={MOCK_ANALYTICS.volunteerEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#0a0a0f" }} activeDot={{ r: 6 }} name="Active Volunteers" />
                  <Line type="monotone" dataKey="new" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: "#a855f7", strokeWidth: 2, stroke: "#0a0a0f" }} activeDot={{ r: 6 }} name="New Signups" />
                  <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: "20px" }} iconType="circle" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Urgency Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/70">Urgency Distribution</h3>
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Live</span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={stats.needsByUrgency}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.needsByUrgency.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {stats.needsByUrgency.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

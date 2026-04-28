"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Heart, Users, Package, Globe, Clock, ArrowUpRight } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MOCK_ACTIVITIES } from "@/lib/constants";
import { formatTimeAgo, cn } from "@/lib/utils";
import { fetchNeeds, fetchVolunteers } from "@/app/actions/supabase";
import type { Need, Volunteer } from "@/types";
import { CardSkeleton, KPIChartSkeleton } from "@/components/shared/SkeletonLoading";
import { AIRecommendationsPanel } from "@/components/ai/AIRecommendationsPanel";

const activityIcons: Record<string, React.ReactNode> = {
  need_created: <Heart className="w-4 h-4 text-rose-400" />,
  volunteer_joined: <Users className="w-4 h-4 text-blue-400" />,
  resource_delivered: <Package className="w-4 h-4 text-ngo-400" />,
  need_fulfilled: <TrendingUp className="w-4 h-4 text-emerald-400" />,
  alert: <Clock className="w-4 h-4 text-amber-400" />,
};

export default function DashboardPage() {
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
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalNeeds = needs.length;
    const activeVolunteers = volunteers.filter(v => v.availability === "available" || v.availability === "busy").length;
    const resourcesDistributed = needs.reduce((acc, need) => acc + (need.fulfilledQuantity || 0), 0);
    const regionsCovered = new Set(needs.map(n => n.location.address)).size || 1;

    return { totalNeeds, activeVolunteers, resourcesDistributed, regionsCovered };
  }, [needs, volunteers]);

  const statCards = [
    { label: "Total Needs", value: stats.totalNeeds, trend: 12.5, icon: <Heart className="w-5 h-5" />, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Active Volunteers", value: stats.activeVolunteers, trend: 8.3, icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Resources Distributed", value: stats.resourcesDistributed, trend: 15.2, icon: <Package className="w-5 h-5" />, color: "text-ngo-400", bg: "bg-ngo-500/10" },
    { label: "Regions Covered", value: stats.regionsCovered, trend: 5.1, icon: <Globe className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <KPIChartSkeleton className="lg:col-span-2 min-h-[400px]" />
            <KPIChartSkeleton className="min-h-[400px]" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bg, card.color)}>
                    {card.icon}
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-medium", card.trend > 0 ? "text-emerald-400" : "text-red-400")}>
                    {card.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.trend)}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter target={card.value} />
                </div>
                <div className="text-xs text-white/40">{card.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white/80">Recent Activity</h2>
                <button className="text-xs text-ngo-400 hover:text-ngo-300 transition-colors">View all</button>
              </div>
              <div className="space-y-1">
                {MOCK_ACTIVITIES.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {activityIcons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 font-medium">{activity.title}</p>
                      <p className="text-xs text-white/35 mt-0.5 truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-white/25 flex-shrink-0">{formatTimeAgo(activity.timestamp)}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Active Needs */}
          <div>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white/80">Active Needs</h2>
                <a href="/needs" className="text-xs text-ngo-400 hover:text-ngo-300 flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-3">
                {needs.filter((n) => n.status !== "fulfilled" && n.status !== "closed").slice(0, 5).map((need, i) => (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-white/70 truncate pr-2">{need.title}</p>
                      <StatusBadge label={need.urgency} variant="urgency" />
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-ngo-500 rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${(need.fulfilledQuantity / (need.quantity || 1)) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/30">
                      <span>{need.fulfilledQuantity}/{need.quantity} fulfilled</span>
                      <span>{need.location.address}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <AIRecommendationsPanel needs={needs} volunteers={volunteers} />
        </motion.div>
      </div>
    </PageTransition>
  );
}

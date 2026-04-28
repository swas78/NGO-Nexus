"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { Heart, Users, Layers, Activity, Route, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Need, Volunteer } from "@/types";
import { fetchNeeds, fetchVolunteers } from "@/app/actions/supabase";

// Dynamically import MapView with no SSR
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center text-white/50 bg-[#0a0a0f] rounded-2xl">Loading map...</div> }
);

export default function MapPage() {
  const [showNeeds, setShowNeeds] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showHeatZones, setShowHeatZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [needsData, volsData] = await Promise.all([
          fetchNeeds(),
          fetchVolunteers()
        ]);
        setNeeds(needsData);
        setVolunteers(volsData);
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAssign = (needId: string, volId: string) => {
    // In a real app, this would trigger an API call to assign the volunteer
    console.log(`Assigned volunteer ${volId} to need ${needId}`);
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/90">Live Coordination Map</h2>
            <p className="text-sm text-white/40 mt-1">
              {showNeeds ? needs.length : 0} needs · {showVolunteers ? volunteers.length : 0} volunteers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNeeds(!showNeeds)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                showNeeds ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-white/40 border border-white/5"
              )}
            >
              <Heart className="w-3.5 h-3.5" /> Needs
            </button>
            <button
              onClick={() => setShowVolunteers(!showVolunteers)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                showVolunteers ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/5 text-white/40 border border-white/5"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Volunteers
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
            <button
              onClick={() => setShowHeatZones(!showHeatZones)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                showHeatZones ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-white/40 border border-white/5"
              )}
            >
              <Activity className="w-3.5 h-3.5" /> Heat Zones
            </button>
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                showRoutes ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-white/40 border border-white/5"
              )}
            >
              <Route className="w-3.5 h-3.5" /> Routes
            </button>
          </div>
        </div>

        {/* Map */}
        <GlassCard className="p-0 overflow-hidden h-[calc(100vh-220px)] border-white/5 relative" hover={false}>
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-white/50 bg-[#0a0a0f] rounded-2xl">
               <Loader2 className="w-8 h-8 text-ngo-500 animate-spin mb-4" />
               <p className="text-sm">Loading live map data...</p>
            </div>
          ) : (
            <MapView
              needs={needs}
              volunteers={volunteers}
              showNeeds={showNeeds}
              showVolunteers={showVolunteers}
              showHeatZones={showHeatZones}
              showRoutes={showRoutes}
              selectedNeed={selectedNeed}
              onSelectNeed={setSelectedNeed}
              onAssign={handleAssign}
            />
          )}
        </GlassCard>

        {/* Legend */}
        <GlassCard className="p-4 flex flex-wrap items-center gap-6" hover={false}>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Layers className="w-4 h-4 text-white/30" />
            <span className="font-medium uppercase tracking-wider">Legend:</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
               <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
            </div>
            Critical Need
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]">
               <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
            </div>
            High Need
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
             <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.35)]">
               <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
            </div>
            Medium Need
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-white/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            Volunteer
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
             <div className="w-4 h-1 border-t-2 border-emerald-500 border-dashed opacity-70" />
             Matched Route
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}

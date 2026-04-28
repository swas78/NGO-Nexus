"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Star, MapPin, Pencil, Trash2, Eye, X } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { VolunteerFormModal } from "@/components/volunteers/VolunteerFormModal";
import { getAvailabilityColor, cn } from "@/lib/utils";
import type { Volunteer } from "@/types";
import { fetchVolunteers, createVolunteer, updateVolunteer, deleteVolunteer } from "@/app/actions/supabase";
import { CardSkeleton } from "@/components/shared/SkeletonLoading";
import { EmptyState } from "@/components/shared/EmptyState";
import { TrustScoreBadge } from "@/components/volunteers/TrustScoreBadge";

export default function VolunteersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVol, setEditVol] = useState<Volunteer | null>(null);
  const [detailVol, setDetailVol] = useState<Volunteer | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const volsData = await fetchVolunteers();
        setVolunteers(volsData);
      } catch (error) {
        console.error("Failed to fetch volunteers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filter !== "all" && v.availability !== filter) return false;
      return true;
    });
  }, [volunteers, search, filter]);

  const handleSave = async (data: Partial<Volunteer>) => {
    try {
      setIsLoading(true);
      if (editVol) {
        // Optimistic update
        setVolunteers((prev) => prev.map((v) => v.id === editVol.id ? { ...v, ...data } : v));
        await updateVolunteer(editVol.id, data);
      } else {
        await createVolunteer(data);
      }
      const updated = await fetchVolunteers();
      setVolunteers(updated);
    } catch (error) {
      console.error("Failed to save volunteer:", error);
    } finally {
      setIsLoading(false);
      setEditVol(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic delete
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
      await deleteVolunteer(id);
    } catch (error) {
      console.error("Failed to delete volunteer:", error);
      // Re-fetch to restore state if delete fails
      const updated = await fetchVolunteers();
      setVolunteers(updated);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/90">Volunteers</h2>
            <p className="text-sm text-white/40 mt-1">{filtered.length} of {volunteers.length} volunteers</p>
          </div>
          <button onClick={() => { setEditVol(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2 text-sm" disabled={isLoading}>
            <UserPlus className="w-4 h-4" /> Register Volunteer
          </button>
        </div>

        {/* Filters */}
        <GlassCard className="p-4" hover={false}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or skill..." className="w-full sm:w-72" />
            <div className="flex gap-2">
              {["all", "available", "busy", "offline"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all", filter === f ? "bg-ngo-500/20 text-ngo-400 border border-ngo-500/30" : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/8")}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            title="No volunteers found" 
            description="We couldn't find any volunteers matching your search criteria. Try a different skill or name."
            action={
              <button onClick={() => setFormOpen(true)} className="btn-primary mt-4 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Register Volunteer
              </button>
            }
          />
        ) : (
          /* Volunteer Cards */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((vol, i) => (
                <motion.div key={vol.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04, duration: 0.3 }}>
                  <GlassCard className="p-5 h-full group glass-card-interactive">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={vol.avatar} alt={vol.name} className="w-12 h-12 rounded-xl bg-white/5" />
                        <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface", getAvailabilityColor(vol.availability))} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white/80 truncate">{vol.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-white/35 mt-0.5">
                          <MapPin className="w-3 h-3" /> {vol.location.address}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {vol.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-white/50 border border-white/5">{skill}</span>
                      ))}
                    </div>

                    {/* Trust Score */}
                    <div className="flex items-center justify-between mb-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/30 uppercase tracking-wider">Trust Score</span>
                      <TrustScoreBadge volunteer={vol} size="sm" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5"><Star className="w-3 h-3" /><span className="text-sm font-semibold">{vol.rating}</span></div>
                        <span className="text-[10px] text-white/30">Rating</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white/70 mb-0.5">{vol.totalHours}</div>
                        <span className="text-[10px] text-white/30">Hours</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white/70 mb-0.5">{vol.missionsCompleted}</div>
                        <span className="text-[10px] text-white/30">Missions</span>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDetailVol(vol)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/60 hover:bg-white/5 transition-all"><Eye className="w-3 h-3" /> View</button>
                      <button onClick={() => { setEditVol(vol); setFormOpen(true); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-ngo-400/60 hover:text-ngo-400 hover:bg-ngo-500/5 transition-all"><Pencil className="w-3 h-3" /> Edit</button>
                      <button onClick={() => handleDelete(vol.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all"><Trash2 className="w-3 h-3" /> Delete</button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <VolunteerFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditVol(null); }} onSave={handleSave} editVolunteer={editVol} />

      {/* Detail Modal */}
      <AnimatePresence>
        {detailVol && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailVol(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md glass-card-static p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={detailVol.avatar} alt={detailVol.name} className="w-14 h-14 rounded-xl bg-white/5" />
                  <div>
                    <h2 className="text-lg font-semibold text-white/90">{detailVol.name}</h2>
                    <p className="text-xs text-white/35 flex items-center gap-1"><MapPin className="w-3 h-3" /> {detailVol.location.address}</p>
                  </div>
                </div>
                <button onClick={() => setDetailVol(null)} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">{detailVol.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded-md bg-ngo-500/10 text-[11px] text-ngo-400 border border-ngo-500/20">{s}</span>)}</div>
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/5">
                <div className="text-center"><p className="text-lg font-bold text-amber-400">{detailVol.rating}</p><p className="text-[10px] text-white/30">Rating</p></div>
                <div className="text-center"><p className="text-lg font-bold text-white/80">{detailVol.totalHours}</p><p className="text-[10px] text-white/30">Hours</p></div>
                <div className="text-center"><p className="text-lg font-bold text-white/80">{detailVol.missionsCompleted}</p><p className="text-[10px] text-white/30">Missions</p></div>
                <div className="text-center"><p className="text-lg font-bold capitalize" style={{ color: detailVol.availability === "available" ? "#10b981" : detailVol.availability === "busy" ? "#f59e0b" : "#71717a" }}>{detailVol.availability}</p><p className="text-[10px] text-white/30">Status</p></div>
              </div>
              <div className="pt-3 border-t border-white/5 space-y-1 text-xs text-white/40">
                <p>📧 {detailVol.email}</p>
                <p>📱 {detailVol.phone}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setDetailVol(null); setEditVol(detailVol); setFormOpen(true); }} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { handleDelete(detailVol.id); setDetailVol(null); }} className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2 !text-red-400 !border-red-500/20 hover:!bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

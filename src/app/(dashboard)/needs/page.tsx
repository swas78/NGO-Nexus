"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, ArrowUpDown, Eye, Pencil, Trash2, ChevronDown, X, Users } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchBar } from "@/components/shared/SearchBar";
import { NeedFormModal } from "@/components/needs/NeedFormModal";
import { VolunteerMatchModal } from "@/components/volunteers/VolunteerMatchModal";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import type { Need, NeedCategory, UrgencyLevel, Volunteer } from "@/types";
import { fetchNeeds, createNeed, updateNeed, deleteNeed, fetchVolunteers, assignVolunteer } from "@/app/actions/supabase";
import { CardSkeleton } from "@/components/shared/SkeletonLoading";
import { EmptyState } from "@/components/shared/EmptyState";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

const categories: NeedCategory[] = ["food", "shelter", "medical", "education", "clothing", "water", "transport", "other"];
const urgencies: UrgencyLevel[] = ["critical", "high", "medium", "low"];
const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

type SortKey = "urgency" | "date" | "progress" | "people";
type ViewMode = "cards" | "table";

export default function NeedsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("urgency");
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [formOpen, setFormOpen] = useState(false);
  const [editNeed, setEditNeed] = useState<Need | null>(null);
  
  const [needs, setNeeds] = useState<Need[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [detailNeed, setDetailNeed] = useState<Need | null>(null);
  const [matchNeed, setMatchNeed] = useState<Need | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [needsData, volsData] = await Promise.all([
          fetchNeeds(),
          fetchVolunteers()
        ]);
        setNeeds(needsData);
        setAllVolunteers(volsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const result = needs.filter((need) => {
      if (search && !need.title.toLowerCase().includes(search.toLowerCase()) && !(need.description || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory !== "all" && need.category !== selectedCategory) return false;
      if (selectedUrgency !== "all" && need.urgency !== selectedUrgency) return false;
      if (selectedStatus !== "all" && need.status !== selectedStatus) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "urgency": cmp = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]; break;
        case "date": cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); break;
        case "progress": cmp = (a.fulfilledQuantity / a.quantity) - (b.fulfilledQuantity / b.quantity); break;
        case "people": cmp = b.quantity - a.quantity; break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [needs, search, selectedCategory, selectedUrgency, selectedStatus, sortBy, sortAsc]);

  const handleSave = async (data: Partial<Need>) => {
    try {
      setIsLoading(true);
      if (editNeed) {
        // Optimistic update
        setNeeds((prev) => prev.map((n) => n.id === editNeed.id ? { ...n, ...data } : n));
        await updateNeed(editNeed.id, data);
      } else {
        await createNeed(data);
      }
      const updated = await fetchNeeds();
      setNeeds(updated);
    } catch (error) {
      console.error("Failed to save need:", error);
    } finally {
      setIsLoading(false);
      setEditNeed(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic delete
      setNeeds((prev) => prev.filter((n) => n.id !== id));
      await deleteNeed(id);
    } catch (error) {
      console.error("Failed to delete need:", error);
      // Re-fetch to restore state if delete fails
      const updated = await fetchNeeds();
      setNeeds(updated);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  const urgencyColors: Record<string, string> = {
    critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-emerald-500",
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/90">Needs Management</h2>
            <p className="text-sm text-white/40 mt-1">{filtered.length} of {needs.length} needs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-white/8 overflow-hidden">
              <button onClick={() => setViewMode("cards")} className={cn("p-2 text-xs transition-colors", viewMode === "cards" ? "bg-ngo-500/20 text-ngo-400" : "text-white/30 hover:text-white/50")}>Cards</button>
              <button onClick={() => setViewMode("table")} className={cn("p-2 text-xs transition-colors", viewMode === "table" ? "bg-ngo-500/20 text-ngo-400" : "text-white/30 hover:text-white/50")}>Table</button>
            </div>
            <button onClick={() => { setEditNeed(null); setFormOpen(true); }} className="btn-primary flex items-center gap-2 text-sm" disabled={isLoading}>
              <Plus className="w-4 h-4" /> Add Need
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <GlassCard className="p-4" hover={false}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Search needs..." className="w-full lg:w-72" />
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-white/30" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 outline-none focus:border-ngo-500/40 transition-colors">
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{CATEGORY_CONFIG[c]?.label || c}</option>)}
              </select>
              <select value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)} className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 outline-none focus:border-ngo-500/40 transition-colors">
                <option value="all">All Urgencies</option>
                {urgencies.map((u) => <option key={u} value={u} className="capitalize">{u}</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 outline-none focus:border-ngo-500/40 transition-colors">
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="closed">Closed</option>
              </select>

              {/* Sort */}
              <div className="flex items-center gap-1 ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-white/30" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white/70 outline-none">
                  <option value="urgency">Urgency</option>
                  <option value="date">Date</option>
                  <option value="progress">Progress</option>
                  <option value="people">People</option>
                </select>
                <button onClick={() => setSortAsc(!sortAsc)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white/60 transition-colors text-xs">
                  {sortAsc ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            title="No needs found" 
            description="Adjust your filters or search terms to find what you're looking for, or add a new need to the database."
            action={
              <button onClick={() => setFormOpen(true)} className="btn-primary mt-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Need
              </button>
            }
          />
        ) : (
          <>
            {/* ═══════ CARDS VIEW ═══════ */}
            {viewMode === "cards" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((need, i) => (
                    <motion.div
                      key={need.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                    >
                      <GlassCard className="p-5 h-full flex flex-col group glass-card-interactive">
                        {/* Urgency indicator line */}
                        <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl", urgencyColors[need.urgency])} />

                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: (CATEGORY_CONFIG[need.category]?.color || "#6b7280") + "15", color: CATEGORY_CONFIG[need.category]?.color || "#6b7280" }}>
                            {need.category.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex gap-1.5">
                            <StatusBadge label={need.urgency} variant="urgency" />
                            <StatusBadge label={need.status} variant="status" />
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-white/80 mb-2 line-clamp-1">{need.title}</h3>
                        <p className="text-xs text-white/35 line-clamp-2 mb-4 flex-1">{need.description}</p>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>{need.quantity} people affected</span>
                            <span>{Math.round((need.fulfilledQuantity / need.quantity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(need.fulfilledQuantity / need.quantity) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn("rounded-full h-1.5", urgencyColors[need.urgency])}
                              style={{ opacity: 0.7 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/25 pt-2 border-t border-white/5">
                          <span className="truncate mr-2">{need.location.address}</span>
                          <span className="flex-shrink-0">{formatDate(need.createdAt)}</span>
                        </div>

                        {/* AI Insight */}
                        <AIInsightCard
                          needTitle={need.title}
                          needCategory={need.category}
                          needUrgency={need.urgency}
                          needDescription={need.description}
                          needQuantity={need.quantity}
                          needLocation={need.location.address}
                          needCreatedAt={need.createdAt}
                        />

                        {/* Hover actions */}
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDetailNeed(need)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button onClick={() => setMatchNeed(need)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/5 transition-all">
                            <Users className="w-3 h-3" /> Match
                          </button>
                          <button onClick={() => { setEditNeed(need); setFormOpen(true); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-ngo-400/60 hover:text-ngo-400 hover:bg-ngo-500/5 transition-all">
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleDelete(need.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* ═══════ TABLE VIEW ═══════ */}
            {viewMode === "table" && (
              <GlassCard className="overflow-hidden" hover={false}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {[
                          { key: "urgency", label: "Urgency" },
                          { key: null, label: "Title" },
                          { key: null, label: "Category" },
                          { key: "people", label: "Affected" },
                          { key: "progress", label: "Progress" },
                          { key: null, label: "Status" },
                          { key: "date", label: "Date" },
                          { key: null, label: "" },
                        ].map((col, idx) => (
                          <th
                            key={idx}
                            onClick={() => col.key && toggleSort(col.key as SortKey)}
                            className={cn(
                              "px-4 py-3 text-left text-[11px] font-medium text-white/30 uppercase tracking-wider",
                              col.key && "cursor-pointer hover:text-white/50 transition-colors"
                            )}
                          >
                            <span className="flex items-center gap-1">
                              {col.label}
                              {col.key && sortBy === col.key && <ChevronDown className={cn("w-3 h-3 transition-transform", !sortAsc && "rotate-180")} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filtered.map((need) => (
                          <motion.tr
                            key={need.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <div className={cn("w-2.5 h-2.5 rounded-full", urgencyColors[need.urgency])} />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-white/70 font-medium truncate max-w-[200px]">{need.title}</p>
                              <p className="text-[11px] text-white/25 truncate max-w-[200px]">{need.location.address}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-0.5 rounded-md capitalize" style={{ backgroundColor: (CATEGORY_CONFIG[need.category]?.color || "#888") + "15", color: CATEGORY_CONFIG[need.category]?.color || "#888" }}>
                                {need.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-white/50">{need.quantity}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-white/5 rounded-full h-1.5">
                                  <div className={cn("rounded-full h-1.5", urgencyColors[need.urgency])} style={{ width: `${(need.fulfilledQuantity / need.quantity) * 100}%`, opacity: 0.7 }} />
                                </div>
                                <span className="text-[11px] text-white/30">{Math.round((need.fulfilledQuantity / need.quantity) * 100)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><StatusBadge label={need.status} variant="status" /></td>
                            <td className="px-4 py-3 text-xs text-white/30">{formatDate(need.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditNeed(need); setFormOpen(true); }} className="p-1.5 rounded-lg text-white/30 hover:text-ngo-400 hover:bg-ngo-500/5 transition-all">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(need.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>

      {/* ═══════ FORM MODAL ═══════ */}
      <NeedFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditNeed(null); }}
        onSave={handleSave}
        editNeed={editNeed}
      />

      {/* ═══════ DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {detailNeed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailNeed(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card-static p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white/90">{detailNeed.title}</h2>
                  <p className="text-xs text-white/35 mt-1">{detailNeed.location.address}</p>
                </div>
                <button onClick={() => setDetailNeed(null)} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <StatusBadge label={detailNeed.urgency} variant="urgency" />
                <StatusBadge label={detailNeed.status} variant="status" />
                <span className="text-xs px-2 py-0.5 rounded-md capitalize" style={{ backgroundColor: (CATEGORY_CONFIG[detailNeed.category]?.color || "#888") + "15", color: CATEGORY_CONFIG[detailNeed.category]?.color || "#888" }}>
                  {detailNeed.category}
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{detailNeed.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">People Affected</p><p className="text-lg font-bold text-white/80">{detailNeed.quantity}</p></div>
                <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Fulfilled</p><p className="text-lg font-bold text-white/80">{detailNeed.fulfilledQuantity} <span className="text-xs font-normal text-white/30">/ {detailNeed.quantity}</span></p></div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className={cn("rounded-full h-2", urgencyColors[detailNeed.urgency])} style={{ width: `${(detailNeed.fulfilledQuantity / detailNeed.quantity) * 100}%`, opacity: 0.7 }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setDetailNeed(null); setMatchNeed(detailNeed); }} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Find Volunteers
                </button>
                <button onClick={() => { setDetailNeed(null); setEditNeed(detailNeed); setFormOpen(true); }} className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { handleDelete(detailNeed.id); setDetailNeed(null); }} className="btn-secondary text-sm flex items-center justify-center gap-2 !text-red-400 !border-red-500/20 hover:!bg-red-500/10 px-4">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ MATCH MODAL ═══════ */}
      <VolunteerMatchModal
        open={!!matchNeed}
        onClose={() => setMatchNeed(null)}
        need={matchNeed}
        volunteers={allVolunteers}
        onAssign={async (needId, volId) => {
          try {
            await assignVolunteer(needId, volId);
            // Optimistic update
            setNeeds((prev) => prev.map((n) => n.id === needId ? { ...n, assignedVolunteers: [...n.assignedVolunteers, volId], status: "in-progress" } : n));
          } catch (error) {
            console.error("Failed to assign:", error);
          }
        }}
      />
    </PageTransition>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { OCRUpload } from "./OCRUpload";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import type { Need, NeedCategory, UrgencyLevel, NeedStatus } from "@/types";

interface NeedFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (need: Partial<Need>) => void;
  editNeed?: Need | null;
}

const categories: NeedCategory[] = ["food", "shelter", "medical", "education", "clothing", "water", "transport", "other"];
const urgencies: UrgencyLevel[] = ["critical", "high", "medium", "low"];
const statuses: NeedStatus[] = ["open", "in-progress", "fulfilled", "closed"];

interface FormField {
  value: string;
  touched: boolean;
}

export function NeedFormModal({ open, onClose, onSave, editNeed }: NeedFormModalProps) {
  const [title, setTitle] = useState<FormField>({ value: "", touched: false });
  const [category, setCategory] = useState<string>("food");
  const [address, setAddress] = useState<FormField>({ value: "", touched: false });
  const [peopleAffected, setPeopleAffected] = useState<FormField>({ value: "", touched: false });
  const [urgency, setUrgency] = useState<string>("medium");
  const [status, setStatus] = useState<string>("open");
  const [notes, setNotes] = useState<FormField>({ value: "", touched: false });
  const [saving, setSaving] = useState(false);

  const isEdit = !!editNeed;

  useEffect(() => {
    if (editNeed) {
      setTitle({ value: editNeed.title, touched: false });
      setCategory(editNeed.category);
      setAddress({ value: editNeed.location.address, touched: false });
      setPeopleAffected({ value: editNeed.quantity.toString(), touched: false });
      setUrgency(editNeed.urgency);
      setStatus(editNeed.status);
      setNotes({ value: editNeed.description, touched: false });
    } else {
      setTitle({ value: "", touched: false });
      setCategory("food");
      setAddress({ value: "", touched: false });
      setPeopleAffected({ value: "", touched: false });
      setUrgency("medium");
      setStatus("open");
      setNotes({ value: "", touched: false });
    }
  }, [editNeed, open]);

  const handleOCRExtracted = (data: { title: string; category: string; address: string; peopleAffected: number; urgency: string; notes: string }) => {
    setTitle({ value: data.title, touched: true });
    setCategory(data.category);
    setAddress({ value: data.address, touched: true });
    setPeopleAffected({ value: data.peopleAffected.toString(), touched: true });
    setUrgency(data.urgency);
    setNotes({ value: data.notes, touched: true });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave({
      title: title.value,
      category: category as NeedCategory,
      description: notes.value,
      urgency: urgency as UrgencyLevel,
      status: status as NeedStatus,
      quantity: parseInt(peopleAffected.value) || 0,
      location: { lat: 0, lng: 0, address: address.value },
    });
    setSaving(false);
    onClose();
  };

  const urgencyColors: Record<string, string> = {
    critical: "border-red-500/40 bg-red-500/10 text-red-400",
    high: "border-orange-500/40 bg-orange-500/10 text-orange-400",
    medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card-static"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-100/80 backdrop-blur-xl rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white/90">
                {isEdit ? "Edit Need" : "Add New Need"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* OCR Upload (only for new needs) */}
              {!isEdit && <OCRUpload onExtracted={handleOCRExtracted} />}

              <div className="w-full h-px bg-white/5" />

              {/* Title */}
              <div className="relative">
                <label className={cn(
                  "absolute left-3.5 transition-all duration-200 pointer-events-none",
                  title.value || title.touched
                    ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider"
                    : "top-3.5 text-sm text-white/25"
                )}>
                  Title *
                </label>
                <input
                  value={title.value}
                  onChange={(e) => setTitle({ value: e.target.value, touched: true })}
                  onFocus={() => setTitle((p) => ({ ...p, touched: true }))}
                  onBlur={() => !title.value && setTitle((p) => ({ ...p, touched: false }))}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all"
                />
              </div>

              {/* Category + Urgency row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all border",
                          category === c
                            ? "border-ngo-500/40 bg-ngo-500/10 text-ngo-400"
                            : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5"
                        )}
                      >
                        {CATEGORY_CONFIG[c]?.label || c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Urgency</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {urgencies.map((u) => (
                      <button
                        key={u}
                        onClick={() => setUrgency(u)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all border",
                          urgency === u ? urgencyColors[u] : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="relative">
                <label className={cn(
                  "absolute left-3.5 transition-all duration-200 pointer-events-none",
                  address.value || address.touched
                    ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider"
                    : "top-3.5 text-sm text-white/25"
                )}>
                  Address / Location
                </label>
                <input
                  value={address.value}
                  onChange={(e) => setAddress({ value: e.target.value, touched: true })}
                  onFocus={() => setAddress((p) => ({ ...p, touched: true }))}
                  onBlur={() => !address.value && setAddress((p) => ({ ...p, touched: false }))}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all"
                />
              </div>

              {/* People Affected + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={cn(
                    "absolute left-3.5 transition-all duration-200 pointer-events-none",
                    peopleAffected.value || peopleAffected.touched
                      ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider"
                      : "top-3.5 text-sm text-white/25"
                  )}>
                    People Affected
                  </label>
                  <input
                    type="number"
                    value={peopleAffected.value}
                    onChange={(e) => setPeopleAffected({ value: e.target.value, touched: true })}
                    onFocus={() => setPeopleAffected((p) => ({ ...p, touched: true }))}
                    onBlur={() => !peopleAffected.value && setPeopleAffected((p) => ({ ...p, touched: false }))}
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all"
                  />
                </div>

                {isEdit && (
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Status</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(s)}
                          className={cn(
                            "px-2 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all border",
                            status === s ? "border-ngo-500/40 bg-ngo-500/10 text-ngo-400" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="relative">
                <label className={cn(
                  "absolute left-3.5 transition-all duration-200 pointer-events-none",
                  notes.value || notes.touched
                    ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider"
                    : "top-3.5 text-sm text-white/25"
                )}>
                  Notes / Description
                </label>
                <textarea
                  value={notes.value}
                  onChange={(e) => setNotes({ value: e.target.value, touched: true })}
                  onFocus={() => setNotes((p) => ({ ...p, touched: true }))}
                  onBlur={() => !notes.value && setNotes((p) => ({ ...p, touched: false }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-surface-100/80 backdrop-blur-xl rounded-b-2xl">
              <button onClick={onClose} className="btn-secondary !py-2.5 !px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !title.value} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2 disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? "Update Need" : "Create Need"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

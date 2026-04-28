"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Volunteer, VolunteerAvailability } from "@/types";

interface VolunteerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (volunteer: Partial<Volunteer>) => void;
  editVolunteer?: Volunteer | null;
}

const availabilityOptions: VolunteerAvailability[] = ["available", "busy", "offline"];
const commonSkills = ["First Aid", "Logistics", "Cooking", "Teaching", "Driving", "Medical", "Translation", "Counseling", "Construction", "IT Support"];

export function VolunteerFormModal({ open, onClose, onSave, editVolunteer }: VolunteerFormModalProps) {
  const [name, setName] = useState(editVolunteer?.name || "");
  const [email, setEmail] = useState(editVolunteer?.email || "");
  const [phone, setPhone] = useState(editVolunteer?.phone || "");
  const [address, setAddress] = useState(editVolunteer?.location.address || "");
  const [availability, setAvailability] = useState<VolunteerAvailability>(editVolunteer?.availability || "available");
  const [skills, setSkills] = useState<string[]>(editVolunteer?.skills || []);
  const [customSkill, setCustomSkill] = useState("");
  const [maxDistance, setMaxDistance] = useState("25");
  const [saving, setSaving] = useState(false);

  const isEdit = !!editVolunteer;

  const toggleSkill = (skill: string) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSave({
      name,
      email,
      phone,
      skills,
      availability,
      location: { lat: 28.6139 + (Math.random() - 0.5) * 2, lng: 77.209 + (Math.random() - 0.5) * 2, address },
    });
    setSaving(false);
    onClose();
  };

  const availColors: Record<string, string> = {
    available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    busy: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    offline: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto glass-card-static"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-100/80 backdrop-blur-xl rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white/90">{isEdit ? "Edit Volunteer" : "Register Volunteer"}</h2>
              <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={cn("absolute left-3.5 transition-all duration-200 pointer-events-none", name ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider" : "top-3.5 text-sm text-white/25")}>Full Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
                </div>
                <div className="relative">
                  <label className={cn("absolute left-3.5 transition-all duration-200 pointer-events-none", email ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider" : "top-3.5 text-sm text-white/25")}>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={cn("absolute left-3.5 transition-all duration-200 pointer-events-none", phone ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider" : "top-3.5 text-sm text-white/25")}>Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
                </div>
                <div className="relative">
                  <label className={cn("absolute left-3.5 transition-all duration-200 pointer-events-none", address ? "top-1 text-[10px] text-ngo-400 uppercase tracking-wider" : "top-3.5 text-sm text-white/25")}><MapPin className="w-3 h-3 inline mr-1" />Location</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-white/5 border border-white/8 rounded-xl px-3.5 pt-5 pb-2 text-sm text-white outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
                </div>
              </div>

              {/* Max Travel Distance */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Max Travel Distance: <span className="text-ngo-400">{maxDistance} km</span></label>
                <input type="range" min="5" max="100" step="5" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ngo-500 [&::-webkit-slider-thumb]:shadow-lg" />
                <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>5 km</span><span>100 km</span></div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Availability</label>
                <div className="flex gap-2">
                  {availabilityOptions.map((a) => (
                    <button key={a} onClick={() => setAvailability(a)} className={cn("flex-1 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all border", availability === a ? availColors[a] : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5")}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {commonSkills.map((skill) => (
                    <button key={skill} onClick={() => toggleSkill(skill)} className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border", skills.includes(skill) ? "border-ngo-500/40 bg-ngo-500/10 text-ngo-400" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/5")}>
                      {skill}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomSkill()} placeholder="Add custom skill..." className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-ngo-500/40 transition-all placeholder:text-white/20" />
                  <button onClick={addCustomSkill} className="p-2 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-ngo-400 hover:border-ngo-500/30 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-surface-100/80 backdrop-blur-xl rounded-b-2xl">
              <button onClick={onClose} className="btn-secondary !py-2.5 !px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !name} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2 disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? "Update" : "Register"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

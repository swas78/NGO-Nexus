"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, Star, Clock, CheckCircle2, UserPlus, Trophy, Zap } from "lucide-react";
import { cn, getAvailabilityColor } from "@/lib/utils";
import type { Need, Volunteer } from "@/types";

interface MatchResult {
  volunteer: Volunteer;
  overallScore: number;
  skillMatch: number;
  distanceKm: number;
  availabilityScore: number;
  matchedSkills: string[];
}

interface VolunteerMatchModalProps {
  open: boolean;
  onClose: () => void;
  need: Need | null;
  volunteers: Volunteer[];
  onAssign: (needId: string, volunteerId: string) => void;
}

function computeMatches(need: Need, volunteers: Volunteer[]): MatchResult[] {
  const needSkills = getNeedSkills(need.category);

  return volunteers
    .map((vol) => {
      const matchedSkills = vol.skills.filter((s) => needSkills.some((ns) => s.toLowerCase().includes(ns.toLowerCase())));
      const skillMatch = needSkills.length > 0 ? Math.min((matchedSkills.length / needSkills.length) * 100, 100) : 50;

      const dLat = need.location.lat - vol.location.lat;
      const dLng = need.location.lng - vol.location.lng;
      const distanceKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111);

      const availabilityScore = vol.availability === "available" ? 100 : vol.availability === "busy" ? 40 : 0;

      const distScore = Math.max(0, 100 - distanceKm * 2);
      const overallScore = Math.round(skillMatch * 0.4 + distScore * 0.3 + availabilityScore * 0.2 + Math.min(vol.rating * 20, 100) * 0.1);

      return { volunteer: vol, overallScore, skillMatch: Math.round(skillMatch), distanceKm, availabilityScore, matchedSkills };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3);
}

function getNeedSkills(category: string): string[] {
  const map: Record<string, string[]> = {
    food: ["Cooking", "Logistics", "Driving"],
    shelter: ["Construction", "Logistics"],
    medical: ["Medical", "First Aid", "Counseling"],
    education: ["Teaching", "IT Support", "Translation"],
    clothing: ["Logistics", "Driving"],
    water: ["Logistics", "Construction"],
    transport: ["Driving", "Logistics"],
    other: ["Logistics"],
  };
  return map[category] || map.other;
}

const rankColors = ["text-amber-400", "text-zinc-300", "text-orange-700"];
const rankBgs = ["bg-amber-500/10 border-amber-500/20", "bg-zinc-400/10 border-zinc-400/20", "bg-orange-700/10 border-orange-700/20"];

export function VolunteerMatchModal({ open, onClose, need, volunteers, onAssign }: VolunteerMatchModalProps) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);

  useEffect(() => {
    if (open && need) {
      setLoading(true);
      setAssigned([]);
      const timer = setTimeout(() => {
        setMatches(computeMatches(need, volunteers));
        setLoading(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [open, need, volunteers]);

  const handleAssign = (volId: string) => {
    if (need) {
      setAssigned((prev) => [...prev, volId]);
      onAssign(need.id, volId);
    }
  };

  return (
    <AnimatePresence>
      {open && need && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl glass-card-static overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 text-ngo-400 text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Volunteer Matching
                </div>
                <h2 className="text-lg font-semibold text-white/90">{need.title}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
            </div>

            {/* Need context */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {need.location.address}</span>
              <span className="px-2 py-0.5 rounded-md capitalize" style={{ backgroundColor: need.urgency === "critical" ? "#ef444420" : need.urgency === "high" ? "#f9731620" : "#eab30820", color: need.urgency === "critical" ? "#ef4444" : need.urgency === "high" ? "#f97316" : "#eab308" }}>
                {need.urgency}
              </span>
              <span>{need.quantity} affected</span>
            </div>

            {/* Results */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Zap className="w-8 h-8 text-ngo-400" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm text-white/60 mb-1">Analyzing volunteer profiles...</p>
                    <p className="text-xs text-white/25">Scoring skills, proximity & availability</p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }} className="w-2 h-2 rounded-full bg-ngo-500" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-white/30 uppercase tracking-wider">Top 3 Matches</p>

                  {matches.map((match, i) => (
                    <motion.div
                      key={match.volunteer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2, duration: 0.4 }}
                      className="relative rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                    >
                      {/* Rank badge */}
                      <div className={cn("absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold", rankBgs[i], rankColors[i])}>
                        {i === 0 ? <Trophy className="w-4 h-4" /> : `#${i + 1}`}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={match.volunteer.avatar} alt={match.volunteer.name} className="w-12 h-12 rounded-xl bg-white/5" />
                            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface", getAvailabilityColor(match.volunteer.availability))} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white/80">{match.volunteer.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.distanceKm} km away</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {match.volunteer.rating}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match.volunteer.totalHours}h</span>
                            </div>

                            {/* Matched Skills */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {match.volunteer.skills.map((skill) => (
                                <span key={skill} className={cn("px-1.5 py-0.5 rounded text-[10px] border", match.matchedSkills.includes(skill) ? "bg-ngo-500/10 border-ngo-500/20 text-ngo-400" : "bg-white/[0.03] border-white/5 text-white/30")}>
                                  {match.matchedSkills.includes(skill) && <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />}
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Score Bars */}
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/5">
                          <ScoreBar label="Skill Match" value={match.skillMatch} color="bg-blue-500" />
                          <ScoreBar label="Proximity" value={Math.max(0, 100 - match.distanceKm * 2)} color="bg-ngo-500" />
                          <ScoreBar label="Availability" value={match.availabilityScore} color="bg-amber-500" />
                        </div>

                        {/* Overall + Assign */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-white/90">{match.overallScore}</div>
                            <div className="text-[10px] text-white/30 uppercase tracking-wider leading-tight">Overall<br />Score</div>
                          </div>
                          <button
                            onClick={() => handleAssign(match.volunteer.id)}
                            disabled={assigned.includes(match.volunteer.id)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                              assigned.includes(match.volunteer.id)
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                                : "btn-primary !py-2 !px-4"
                            )}
                          >
                            {assigned.includes(match.volunteer.id) ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Assigned</>
                            ) : (
                              <><UserPlus className="w-3.5 h-3.5" /> Assign</>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-white/30 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className={cn("rounded-full h-1.5", color)}
          style={{ opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

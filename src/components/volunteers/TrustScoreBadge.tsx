"use client";

import { motion } from "framer-motion";
import { calculateTrustScore } from "@/lib/services/trustScore";
import type { Volunteer } from "@/types";
import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
  volunteer: Volunteer;
  showBreakdown?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TrustScoreBadge({ volunteer, showBreakdown = false, size = "md" }: TrustScoreBadgeProps) {
  const trust = calculateTrustScore(volunteer);

  const rankColors: Record<string, { bg: string; border: string; text: string }> = {
    Elite:    { bg: "bg-amber-500/15",  border: "border-amber-500/30",  text: "text-amber-400" },
    Reliable: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400" },
    Moderate: { bg: "bg-blue-500/15",   border: "border-blue-500/30",   text: "text-blue-400" },
    New:      { bg: "bg-white/5",       border: "border-white/10",      text: "text-white/50" },
  };

  const rc = rankColors[trust.rank];
  const radius = size === "lg" ? 28 : size === "md" ? 20 : 14;
  const stroke = size === "lg" ? 3.5 : 2.5;
  const circumference = 2 * Math.PI * radius;
  const svgSize = (radius + stroke + 2) * 2;

  return (
    <div className={cn("flex items-center gap-2", showBreakdown ? "flex-col" : "flex-row")}>
      {/* Circular Score Indicator */}
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="absolute -rotate-90">
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={trust.glowColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (trust.score / 100) * circumference }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 4px ${trust.glowColor})` }}
          />
        </svg>
        <span className={cn("font-bold tabular-nums leading-none", trust.color,
          size === "lg" ? "text-base" : size === "md" ? "text-[11px]" : "text-[9px]"
        )}>
          {trust.score}
        </span>
      </div>

      {/* Rank Badge */}
      <div className={cn("flex items-center gap-1", showBreakdown && "flex-col items-center")}>
        <span className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
          rc.bg, rc.border, rc.text
        )}>
          {trust.rank}
        </span>

        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 w-full space-y-1.5 text-[10px]"
          >
            {[
              { label: "Completion", val: trust.completionRate, color: "bg-emerald-400" },
              { label: "Speed", val: trust.responseSpeed, color: "bg-blue-400" },
              { label: "Rating", val: trust.normalizedRating, color: "bg-amber-400" },
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex justify-between text-white/40">
                  <span>{item.label}</span>
                  <span>{item.val}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/5">
                  <motion.div
                    className={cn("h-1 rounded-full", item.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ opacity: 0.75 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

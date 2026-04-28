"use client";

import { cn } from "@/lib/utils";
import { getUrgencyColor, getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  variant: "urgency" | "status" | "custom";
  customColor?: string;
  className?: string;
}

export function StatusBadge({ label, variant, customColor, className }: StatusBadgeProps) {
  const colorClass =
    variant === "urgency"
      ? getUrgencyColor(label.toLowerCase())
      : variant === "status"
      ? getStatusColor(label.toLowerCase().replace(" ", "-"))
      : customColor || "text-gray-400 bg-gray-500/10 border-gray-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}

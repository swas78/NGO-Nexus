import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    case "low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "open": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "in-progress": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "fulfilled": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "closed": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
}

export function getAvailabilityColor(availability: string): string {
  switch (availability) {
    case "available": return "bg-emerald-500";
    case "busy": return "bg-amber-500";
    case "offline": return "bg-gray-500";
    default: return "bg-gray-500";
  }
}

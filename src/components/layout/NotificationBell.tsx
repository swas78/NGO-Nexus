"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/constants";
import { formatTimeAgo, cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center min-w-[18px] h-[18px]"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 glass-dropdown overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/80">Notifications</span>
              <span className="text-xs text-ngo-400">{unread} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                    !n.read && "bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", typeColors[n.type])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/80 truncate">{n.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-white/25 mt-1">{formatTimeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

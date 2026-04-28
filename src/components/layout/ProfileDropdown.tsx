"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = [
    { label: "Profile", icon: <User className="w-4 h-4" />, href: "#" },
    { label: "Settings", icon: <Settings className="w-4 h-4" />, href: "#" },
    { label: "Sign Out", icon: <LogOut className="w-4 h-4" />, href: "/login", danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ngo-500 to-ngo-700 flex items-center justify-center">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        <span className="text-sm text-white/60 hidden md:block">Admin</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 glass-dropdown overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-semibold text-white/80">Admin User</p>
              <p className="text-xs text-white/40">admin@ngonexus.org</p>
            </div>
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                  item.danger ? "text-red-400" : "text-white/60 hover:text-white/80"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

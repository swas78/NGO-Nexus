"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        <TopNav />
        <main className="p-6">{children}</main>
      </motion.div>
    </div>
  );
}

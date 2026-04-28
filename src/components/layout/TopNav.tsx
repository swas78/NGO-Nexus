"use client";

import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/shared/SearchBar";
import { NotificationBell } from "./NotificationBell";
import { ProfileDropdown } from "./ProfileDropdown";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/needs": "Resource Needs",
  "/volunteers": "Volunteers",
  "/map": "Map View",
  "/analytics": "Analytics",
};

export function TopNav() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "NGO Nexus";

  return (
    <header className="sticky top-0 z-30 glass-topnav">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-white/90">{title}</h1>
          <p className="text-xs text-white/30">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <SearchBar placeholder="Search anything..." className="w-64 hidden lg:block" />
          <NotificationBell />
          <div className="w-px h-8 bg-white/5 mx-1" />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

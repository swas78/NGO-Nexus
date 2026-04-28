"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = "Search...", value, onChange, className }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState("");
  const val = value ?? internal;
  const setVal = onChange ?? setInternal;

  return (
    <div className={cn("relative group", className)}>
      <Search className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
        focused ? "text-ngo-400" : "text-white/30"
      )} />
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white/90",
          "placeholder:text-white/25 outline-none transition-all duration-300",
          "focus:border-ngo-500/40 focus:bg-white/8 focus:ring-1 focus:ring-ngo-500/20"
        )}
      />
      {val && (
        <button
          onClick={() => setVal("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

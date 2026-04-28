"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GradientText } from "@/components/shared/GradientText";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-ngo-500/8 rounded-full blur-[180px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ngo-500 to-ngo-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">NGO Nexus</span>
        </div>

        <div className="glass-card-static p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-sm text-white/40">Join <GradientText>NGO Nexus</GradientText> and start coordinating</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" placeholder="you@organization.org" className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-ngo-500/40 focus:ring-1 focus:ring-ngo-500/20 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Link href="/dashboard">
              <button className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2 mt-2">
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </form>

          <div className="mt-6 text-center text-sm text-white/30">
            Already have an account?{" "}
            <Link href="/login" className="text-ngo-400 hover:text-ngo-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

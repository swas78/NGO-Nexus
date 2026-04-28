"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles, ArrowRight, Play, ScanText, Brain, Users,
  Shield, Globe, Zap, CheckCircle2, HeartHandshake, Clock, Target,
} from "lucide-react";
import { NetworkGlobe } from "@/components/landing/NetworkGlobe";
import { StatsCounter } from "@/components/landing/StatsCounter";



const howItWorks = [
  {
    icon: <ScanText className="w-7 h-7" />,
    title: "AI OCR Intake",
    description: "Upload handwritten forms, PDFs, or photos. Our AI extracts and digitizes needs data instantly — no manual entry.",
    color: "#3b82f6",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "Smart Urgency Scoring",
    description: "AI analyzes each need across 12+ parameters to assign urgency scores, ensuring critical cases surface first.",
    color: "#f59e0b",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Volunteer Matching",
    description: "Intelligent matching pairs needs with the best volunteers based on skills, proximity, and availability.",
    color: "#10b981",
  },
];

const features = [
  { icon: <Clock className="w-5 h-5" />, title: "Real-time Tracking", desc: "Monitor resource distribution and volunteer deployment in real-time across all regions." },
  { icon: <Target className="w-5 h-5" />, title: "Predictive Analytics", desc: "AI-powered forecasting anticipates demand surges before they become critical." },
  { icon: <Shield className="w-5 h-5" />, title: "Secure & Compliant", desc: "Enterprise-grade security with GDPR compliance and end-to-end encryption." },
  { icon: <Globe className="w-5 h-5" />, title: "Multi-region Support", desc: "Seamless coordination across 40+ countries with multi-language support." },
];

const trustedBy = ["UNICEF", "Red Cross", "WHO", "UNDP", "Doctors Without Borders", "Save the Children"];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* ════════════ HERO ════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 animated-gradient-bg" />
        <NetworkGlobe />
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-ngo-500/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-blue-500/6 rounded-full blur-[160px]" />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ngo-500 to-ngo-700 flex items-center justify-center glow-emerald">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ReliefSync<span className="text-ngo-400"> AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <a href="#how-it-works" className="hover:text-white/70 transition-colors">How it Works</a>
            <a href="#analytics" className="hover:text-white/70 transition-colors">Analytics</a>
            <a href="#features" className="hover:text-white/70 transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm !py-2.5 !px-5">Log In</Link>
            <Link href="/signup" className="btn-primary text-sm !py-2.5 !px-5">Get Started</Link>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ngo-500/10 border border-ngo-500/20 text-ngo-400 text-sm mb-8">
              <Zap className="w-3.5 h-3.5" />
              Trusted by 200+ NGOs Worldwide
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              <span className="text-white">AI-powered NGO</span>
              <br />
              <span className="text-white">coordination for </span>
              <span className="gradient-text">faster</span>
              <br />
              <span className="gradient-text-accent">humanitarian response</span>
            </h1>

            <p className="text-lg md:text-xl text-white/35 max-w-2xl mx-auto mb-10 leading-relaxed">
              ReliefSync AI uses machine learning to digitize intake, score urgency, match volunteers,
              and deliver real-time analytics — so help reaches those who need it most.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary text-base !py-4 !px-10 flex items-center gap-2.5 group">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-secondary text-base !py-4 !px-10 flex items-center gap-2.5">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-ngo-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════ TRUST BAR ════════════ */}
      <section className="relative py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs text-white/20 uppercase tracking-[0.2em] mb-8">Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {trustedBy.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-lg font-semibold text-white/15 hover:text-white/30 transition-colors duration-300"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ngo-500/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatsCounter end={23840} suffix="+" label="Resources Distributed" />
          <StatsCounter end={547} label="Active Volunteers" />
          <StatsCounter end={42} label="Regions Covered" />
          <StatsCounter end={98} suffix="%" label="Fulfillment Rate" />
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ngo-500/5 rounded-full blur-[200px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-ngo-400 mb-4 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              From Chaos to <span className="gradient-text">Coordination</span>
            </h2>
            <p className="text-white/35 max-w-xl mx-auto">Three AI-powered steps that transform humanitarian operations</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass-card p-8 group relative overflow-hidden"
              >
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: item.color + "15" }} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: item.color + "15", color: item.color }}>
                      {item.icon}
                    </div>
                    <span className="text-5xl font-bold text-white/[0.04]">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ LIVE ANALYTICS ════════════ */}
      <section id="analytics" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs uppercase tracking-[0.2em] text-ngo-400 mb-4 block">Live Analytics</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Real-time insights that <span className="gradient-text">drive action</span>
              </h2>
              <p className="text-white/35 mb-8 leading-relaxed">
                Monitor every metric that matters — from response times to resource allocation. Our AI surfaces anomalies
                and recommends optimizations before bottlenecks form.
              </p>
              <div className="space-y-4">
                {["Live resource tracking dashboards", "Predictive demand forecasting", "Volunteer performance analytics", "Automated reporting & exports"].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 text-sm text-white/50">
                    <CheckCircle2 className="w-4 h-4 text-ngo-400 flex-shrink-0" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mock dashboard preview */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ngo-500/5 to-blue-500/5" />
                <div className="relative space-y-4">
                  {/* Mini chart bars */}
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-ngo-600/60 to-ngo-400/40"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ label: "Response Time", value: "18h", change: "-23%" }, { label: "Active Ops", value: "127", change: "+12%" }, { label: "Efficiency", value: "94%", change: "+5%" }].map((m, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/30 mb-1">{m.label}</p>
                        <p className="text-lg font-bold text-white/80">{m.value}</p>
                        <p className="text-[10px] text-ngo-400">{m.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES GRID ════════════ */}
      <section id="features" className="py-24 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent-500/[0.03] rounded-full blur-[180px]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-ngo-400 mb-4 block">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for <span className="gradient-text-accent">impact at scale</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card p-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-ngo-500/10 flex items-center justify-center text-ngo-400 mb-4 group-hover:bg-ngo-500/20 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ngo-500/5 via-transparent to-accent-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-ngo-500/40 to-transparent" />
          <div className="relative">
            <HeartHandshake className="w-12 h-12 text-ngo-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to save more lives, faster?</h2>
            <p className="text-white/35 mb-8 max-w-lg mx-auto">
              Join 200+ NGOs already using ReliefSync AI to coordinate humanitarian response at unprecedented speed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary text-base !py-4 !px-10 flex items-center gap-2 group">
                Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-base !py-4 !px-10">
                Explore Demo
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ngo-500 to-ngo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-white/30">© 2026 ReliefSync AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/25">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Contact</a>
            <a href="#" className="hover:text-white/50 transition-colors">Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

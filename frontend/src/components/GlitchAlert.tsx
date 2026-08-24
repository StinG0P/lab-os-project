"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Machine {
  id: string;
  hostname: string;
  status: string;
}

interface GlitchAlertProps {
  machines: Machine[];
}

export default function GlitchAlert({ machines }: GlitchAlertProps) {
  const offlineMachines = machines.filter((m) => m.status === "offline");

  if (offlineMachines.length === 0) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-black/95 p-4 shadow-[0_0_20px_rgba(255,0,60,0.3)] animate-pulse">
        {/* Holographic scanning overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
            <AlertTriangle className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#ff003c] uppercase glitch-text">
              CRITICAL HARDWARE DETACH
            </h4>
            <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
              Node failure: {offlineMachines.map((m) => m.hostname).join(", ")}
            </p>
          </div>
        </div>

        <div className="absolute right-3 top-3 text-[9px] font-mono text-red-500/50">
          ERR_CONN_TIMEOUT
        </div>
      </div>
    </motion.div>
  );
}

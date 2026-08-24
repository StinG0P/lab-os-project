"use client";

import React, { useEffect, useState, useRef } from "react";

interface HolographicTerminalProps {
  hostname: string;
}

export default function HolographicTerminal({ hostname }: HolographicTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const rawLogs = [
    `[SYS] Initializing connection to node ${hostname}...`,
    `[SYS] Handshake established via secure machine token.`,
    `[SYS] Downloading latest hardware snapshot...`,
    `[SYS] Parsing CPU registers... Done.`,
    `[SYS] Parsing memory metrics... Done.`,
    `[SYS] Reading disk mount tables... Done.`,
    `[SYS] Network interface state verified.`,
    `[SYS] Local package manifest compiled: 3 packages detected.`,
    `[SYS] Telemetry stream operational.`,
    `[SYS] Status: SYSTEM OPTIMAL.`,
  ];

  useEffect(() => {
    setLogs([]);
    let currentLogIndex = 0;
    
    const interval = setInterval(() => {
      if (currentLogIndex < rawLogs.length) {
        setLogs((prev) => [...prev, rawLogs[currentLogIndex] as string]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [hostname]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="rounded-xl border border-[#00bfff]/30 bg-black/95 p-5 font-mono text-[11px] text-[#00bfff] shadow-[0_0_15px_rgba(0,191,255,0.15)] space-y-2 h-44 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[#00bfff]/20 pb-2 text-[10px] opacity-70">
        <span>TACTICAL SHELL CLIENT</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00bfff] animate-ping" />
          ONLINE
        </span>
      </div>
      <div className="space-y-1">
        {logs.map((log, idx) => {
          const isOptimal = log && log.includes("SYSTEM OPTIMAL");
          return (
            <div key={idx} className={`leading-relaxed ${isOptimal ? "text-[#00ffcc] font-bold glitch-text" : ""}`}>
              {log}
            </div>
          );
        })}
        <div className="flex items-center gap-1 leading-relaxed">
          <span>&gt;</span>
          <span className="h-3.5 w-2 bg-[#00bfff] animate-[pulse_1s_infinite]" />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

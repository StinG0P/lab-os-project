"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Copy, Check, Terminal, Download } from "lucide-react";
import axiosInstance from "@/lib/axios";
import NetworkTopology3D from "@/components/NetworkTopology3D";
import HardwareCore3D from "@/components/HardwareCore3D";
import GlitchAlert from "@/components/GlitchAlert";
import TiltCard from "@/components/TiltCard";

interface Machine {
  id: string;
  hostname: string;
  status: string;
  last_checkin_at: string;
}

export default function DashboardPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [orgId, setOrgId] = useState("YOUR_ORG_TOKEN");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrg = localStorage.getItem("org_id");
      if (storedOrg) {
        setOrgId(storedOrg);
      }
    }
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/machines");
      setMachines(response.data.machines || []);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const script = `curl -sSL https://yourdomain.com/install.sh | sudo bash -s -- --token=${orgId}`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.get("/machines/export", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lab-inventory.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export inventory:", error);
    } finally {
      setExporting(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return "just now";
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const filteredMachines = machines.filter((machine) =>
    machine.hostname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Glitch Alert Trigger */}
      <GlitchAlert machines={machines} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Lab Inventory
          </h1>
          <p className="text-sm text-slate-400">
            Monitor and audit active machines in real-time
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by hostname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || machines.length === 0}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-4 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export Inventory"}
          </button>
        </div>
      </div>

      {/* Hero 3D Topology Map */}
      {!loading && machines.length > 0 && (
        <NetworkTopology3D machines={machines} />
      )}

      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 rounded-xl border border-slate-800 bg-slate-900/20 p-6 animate-pulse"
            >
              <div className="h-5 w-2/3 rounded bg-slate-800 mb-4" />
              <div className="h-4 w-1/3 rounded bg-slate-800 mb-2" />
              <div className="h-3 w-1/2 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredMachines.length === 0 ? (
        // Empty State with install script
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center backdrop-blur-xl max-w-3xl mx-auto space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 text-emerald-500">
            <Terminal className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              No Registered Machines
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Run the telemetry agent installer script on any lab PC to automatically register it under your organization.
            </p>
          </div>

          <div className="relative mt-4 flex items-center justify-between gap-4 rounded-lg bg-slate-950 px-4 py-3 border border-slate-800 text-left font-mono text-xs text-slate-300">
            <span className="truncate pr-4">
              curl -sSL https://yourdomain.com/install.sh | sudo bash -s -- --token={orgId}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Bento Grid of active machines
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 3D Hardware Core Model Card */}
          <TiltCard className="tactile-card hud-border p-6 flex flex-col items-center justify-center min-h-[220px]">
            <HardwareCore3D />
            <span className="text-xs font-mono text-white/40 mt-4 tracking-wider">HARDWARE CORE STATUS: OK</span>
          </TiltCard>

          {filteredMachines.map((machine) => (
            <TiltCard
              key={machine.id}
              className="tactile-card hud-border transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.2)]"
            >
              <Link
                href={`/dashboard/machines/${machine.id}`}
                className="group block p-6 h-full w-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors font-shareTech">
                    {machine.hostname}
                  </span>

                  {/* Status Badge */}
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        machine.status === "online" ? "bg-emerald-500 shadow-md shadow-emerald-500/50" : "bg-red-500 shadow-md shadow-red-500/50"
                      }`}
                    />
                    <span
                      className={
                        machine.status === "online" ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {machine.status === "online" ? "Online" : "Offline"}
                    </span>
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Last seen {getRelativeTime(machine.last_checkin_at)}
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}

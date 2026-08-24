"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Network, List, HardDrive, Power } from "lucide-react";
import axiosInstance from "@/lib/axios";
import MachineResourceChart from "@/components/MachineResourceChart";
import HolographicTerminal from "@/components/HolographicTerminal";
import Magnetic from "@/components/Magnetic";
import TiltCard from "@/components/TiltCard";

interface Snapshot {
  cpu_model: string;
  cpu_cores: number;
  ram_total_mb: number;
  ram_used_mb: number;
  disk_json: any;
  os_name: string;
  os_version: string;
  kernel_version: string;
  installed_packages: any;
  ip_address: string;
  mac_address: string;
  uptime_seconds: number;
  last_user: string;
  recorded_at: string;
}

interface MachineDetail {
  id: string;
  hostname: string;
  status: string;
  last_checkin_at: string;
  snapshots: Snapshot[];
}

export default function MachineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    fetchMachineDetail();
  }, [id]);

  const handleWake = async () => {
    try {
      setWaking(true);
      const response = await axiosInstance.post(`/machines/${id}/wake`);
      alert(response.data.message || "Magic packet sent!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to send magic packet.");
    } finally {
      setWaking(false);
    }
  };

  const fetchMachineDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/machines/${id}`);
      setMachine(response.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load machine telemetry details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || "Machine not found."}</p>
        <Link href="/dashboard" className="text-emerald-500 hover:underline">
          &larr; Back to Inventory
        </Link>
      </div>
    );
  }

  const latestSnapshot = machine.snapshots?.[0];

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(`${d} day${d > 1 ? "s" : ""}`);
    if (h > 0) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
    if (m > 0 && d === 0) parts.push(`${m} minute${m > 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") : "0 minutes";
  };

  // Safe parsing for disks
  let disks: any[] = [];
  if (latestSnapshot?.disk_json) {
    disks = Array.isArray(latestSnapshot.disk_json)
      ? latestSnapshot.disk_json
      : [latestSnapshot.disk_json];
  }

  // Safe parsing for packages
  let packages: string[] = [];
  if (latestSnapshot?.installed_packages) {
    packages = Array.isArray(latestSnapshot.installed_packages)
      ? latestSnapshot.installed_packages
      : [];
  }

  const ramUsedPercent = latestSnapshot
    ? Math.round((latestSnapshot.ram_used_mb / latestSnapshot.ram_total_mb) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_0_15px_rgba(0,191,255,0.05)]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{machine.hostname}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                machine.status === "online"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  machine.status === "online" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {machine.status === "online" ? "Online" : "Offline"}
            </span>

            {/* Wake Button */}
            {machine.status !== "online" && (
              <Magnetic>
                <button
                  onClick={handleWake}
                  disabled={waking}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Power className="h-3 w-3" />
                  {waking ? "Waking..." : "Wake Machine"}
                </button>
              </Magnetic>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">ID: {machine.id}</p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-400">Last User logged in</div>
          <div className="text-sm font-semibold text-slate-200">
            {latestSnapshot?.last_user || "N/A"}
          </div>
        </div>
      </div>

      {latestSnapshot ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hardware Card */}
          <TiltCard className="tactile-card hud-border p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <Cpu className="h-5 w-5" />
              <h2>Hardware Specifications</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400 block text-xs font-medium font-shareTech">CPU Model</span>
                <span className="text-slate-200 font-medium">{latestSnapshot.cpu_model}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">CPU Cores</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.cpu_cores}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">RAM Total</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.ram_total_mb} MB</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>RAM Used</span>
                  <span>{latestSnapshot.ram_used_mb} MB ({ramUsedPercent}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(ramUsedPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </TiltCard>

          {/* OS & Network Card */}
          <TiltCard className="tactile-card hud-border p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <Network className="h-5 w-5" />
              <h2>OS & Network</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">OS Name</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.os_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">OS Version</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.os_version}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-xs font-medium font-shareTech">Kernel Version</span>
                <span className="text-slate-200 font-medium">{latestSnapshot.kernel_version}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">IP Address</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.ip_address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs font-medium font-shareTech">MAC Address</span>
                  <span className="text-slate-200 font-medium">{latestSnapshot.mac_address}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-xs font-medium font-shareTech">Uptime</span>
                <span className="text-slate-200 font-medium">{formatUptime(latestSnapshot.uptime_seconds)}</span>
              </div>
            </div>
          </TiltCard>

          {/* Storage Card */}
          <TiltCard className="tactile-card hud-border p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold">
              <HardDrive className="h-5 w-5" />
              <h2>Storage & Disks</h2>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {disks.length === 0 ? (
                <div className="text-slate-500 text-sm">No disk information available.</div>
              ) : (
                disks.map((disk, idx) => {
                  const usedPct = disk.size_gb ? Math.round((disk.used_gb / disk.size_gb) * 100) : 0;
                  return (
                    <div key={idx} className="border-b border-slate-800/80 pb-2 last:border-0 text-sm">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{disk.mount || "/"}</span>
                        <span>{disk.used_gb} / {disk.size_gb} GB ({usedPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(usedPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TiltCard>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-8 text-center text-slate-400">
          No telemetry snapshot has been recorded for this machine yet.
        </div>
      )}

      {/* Software Panel */}
      {latestSnapshot && (
        <TiltCard className="tactile-card hud-border p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold font-shareTech">
            <List className="h-5 w-5" />
            <h2>Installed Packages ({packages.length})</h2>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/50 p-4 font-mono text-xs text-slate-300">
            {packages.length === 0 ? (
              <div className="text-slate-500 text-center py-4">No packages listed.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="truncate rounded bg-slate-900/80 border border-slate-850 px-2 py-1"
                    title={pkg}
                  >
                    {pkg}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TiltCard>
      )}

      {/* Resource Utilization Trends */}
      <TiltCard className="tactile-card hud-border p-6 space-y-4 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
        <div className="flex items-center gap-2 text-emerald-500 font-semibold font-shareTech">
          <Cpu className="h-5 w-5" />
          <h2>Resource Utilization Trends</h2>
        </div>
        <MachineResourceChart machineId={id} />
      </TiltCard>

      {/* Holographic Shell Terminal */}
      {machine && (
        <HolographicTerminal hostname={machine.hostname} />
      )}
    </div>
  );
}

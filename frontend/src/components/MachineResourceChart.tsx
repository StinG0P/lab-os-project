"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "@/lib/axios";

interface HistoryPoint {
  timestamp: string;
  cpu_usage: number;
  ram_used: number;
  ram_total: number;
}

interface MachineResourceChartProps {
  machineId: string;
}

export default function MachineResourceChart({ machineId }: MachineResourceChartProps) {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [machineId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/machines/${machineId}/history`);
      setData(response.data.history || []);
    } catch (err) {
      console.error("Failed to fetch historical telemetry:", err);
      setError("Unable to load resources history chart.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (tick: string) => {
    if (!tick) return "";
    const date = new Date(tick);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/10 rounded-xl border border-slate-800 animate-pulse">
        <div className="text-slate-500 text-sm">Loading analytics history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/10 rounded-xl border border-slate-800">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/10 rounded-xl border border-slate-800">
        <div className="text-slate-500 text-sm">No historical data recorded yet.</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRamUsed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorRamTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#334155" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#334155" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            unit=" MB"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
            itemStyle={{ fontSize: "12px" }}
            labelFormatter={(label) => new Date(label as string).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="ram_total"
            name="Total RAM"
            stroke="#475569"
            fillOpacity={1}
            fill="url(#colorRamTotal)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <Area
            type="monotone"
            dataKey="ram_used"
            name="Used RAM"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorRamUsed)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

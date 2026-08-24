"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, ShieldAlert, Key, X, Mail, Shield, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/lib/axios";
import TiltCard from "@/components/TiltCard";
import Magnetic from "@/components/Magnetic";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TECH");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/team");
      setMembers(response.data.members || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch team registry telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSubmitError("");
      await axiosInstance.post("/team", { email, password, role });
      
      // Reset form & close modal
      setEmail("");
      setPassword("");
      setRole("TECH");
      setShowModal(false);
      
      // Refresh registry
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      setSubmitError(
        err.response?.data?.error || "Failed to establish team credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-[#00ffcc] animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white font-shareTech">
              TEAM REGISTRY SYSTEM
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Administrative credentials provisioning and access logs
            </p>
          </div>
        </div>
        <Magnetic>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Provision Operator
          </button>
        </Magnetic>
      </div>

      {/* Main Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 text-[#00bfff] animate-spin" />
          <span className="text-xs font-mono text-slate-500">POLLING SECURE REGISTRY...</span>
        </div>
      ) : error ? (
        <div className="tactile-card hud-border p-6 text-center text-red-400 space-y-2">
          <ShieldAlert className="h-8 w-8 text-red-500 mx-auto animate-bounce" />
          <p className="font-mono text-xs">{error}</p>
        </div>
      ) : (
        <TiltCard className="tactile-card hud-border p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 pl-4">Operator Email</th>
                  <th className="pb-3">Clearance Role</th>
                  <th className="pb-3">Initialization Date</th>
                  <th className="pb-3 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-4 font-semibold text-white">{member.email}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        member.role === "ADMIN" 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        <Shield className="h-3 w-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {new Date(member.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TiltCard>
      )}

      {/* Provisioning Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-[#00ffcc] mb-4">
                <UserPlus className="h-5 w-5 animate-pulse" />
                <h3 className="text-sm font-bold font-shareTech tracking-widest uppercase">
                  PROVISION NEW ACCESS CREDENTIALS
                </h3>
              </div>

              {submitError && (
                <div className="mb-4 rounded border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-400 font-mono">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Operator Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@test.com"
                      className="w-full rounded border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-[#00ffcc] outline-none focus:border-[#00bfff] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Security Passkey
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-4 text-[#00ffcc] outline-none focus:border-[#00bfff] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Access Clearance Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded border border-slate-800 bg-slate-950 py-2.5 px-3 text-[#00ffcc] outline-none focus:border-[#00bfff] transition-colors"
                  >
                    <option value="TECH">TECH (Standard Operator)</option>
                    <option value="ADMIN">ADMIN (Full Clearance)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <Magnetic>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-5 py-2 text-emerald-400 font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? "Deploying..." : "Deploy Operator"}
                    </button>
                  </Magnetic>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

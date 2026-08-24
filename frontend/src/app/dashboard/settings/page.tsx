"use client";

import React, { useState } from "react";
import { Sliders, Download, Shield, Key, Bell, Save, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import Magnetic from "@/components/Magnetic";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://httpstat.us/200");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [orgToken, setOrgToken] = useState("test_token_123");
  const [copied, setCopied] = useState(false);

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Webhook configuration updated successfully.");
    }, 1000);
  };

  const handleRegenerateKey = () => {
    if (confirm("Are you sure you want to regenerate the Organization API key? Remote Go agents will require updating.")) {
      setRegenerating(true);
      setTimeout(() => {
        const randomHex = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
        setOrgToken(`org_token_${randomHex}`);
        setRegenerating(false);
      }, 1200);
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
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Sliders className="h-7 w-7 text-[#00ffcc] animate-pulse" />
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white font-shareTech">
            SETTINGS CONTROL PANEL
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            System configuration, agent binaries, and alert integrations
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Agent Deployment */}
        <TiltCard className="tactile-card hud-border p-6 space-y-6">
          <div className="flex items-center gap-2.5 text-[#00bfff] font-semibold border-b border-white/5 pb-3">
            <Download className="h-5 w-5" />
            <h2 className="font-shareTech tracking-wider">AGENT DEPLOYMENT BINARIES</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Download the pre-compiled Go telemetry daemon. Copy the binary to your target servers and launch with the organization token to register check-ins.
          </p>
          <div className="space-y-4">
            {/* Windows */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 last:border-0">
              <span className="text-xs font-mono text-slate-300">Windows (x64)</span>
              <Magnetic>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Downloading agent-windows-amd64.exe..."); }}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-white font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download EXE
                </a>
              </Magnetic>
            </div>
            {/* Linux */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 last:border-0">
              <span className="text-xs font-mono text-slate-300">Linux (amd64)</span>
              <Magnetic>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Downloading agent-linux-amd64..."); }}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-white font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download ELF
                </a>
              </Magnetic>
            </div>
            {/* macOS */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 last:border-0">
              <span className="text-xs font-mono text-slate-300">macOS (Darwin-arm64)</span>
              <Magnetic>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Downloading agent-darwin-arm64..."); }}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-white font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Binary
                </a>
              </Magnetic>
            </div>
          </div>
        </TiltCard>

        {/* Card 2: Alert Integrations */}
        <TiltCard className="tactile-card hud-border p-6 space-y-6">
          <div className="flex items-center gap-2.5 text-[#00bfff] font-semibold border-b border-white/5 pb-3">
            <Bell className="h-5 w-5" />
            <h2 className="font-shareTech tracking-wider">CRON ALERT INTEGRATIONS</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Configure external webhook targets. The system monitor task checks telemetry streams and sends alerts when check-in connections fail.
          </p>
          <form onSubmit={handleSaveWebhook} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="webhook-input" className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">
                Slack/Discord Webhook URL
              </label>
              <input
                id="webhook-input"
                type="url"
                required
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-mono text-[#00ffcc] outline-none focus:border-[#00bfff] transition-colors"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <Magnetic>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Webhook"}
              </button>
            </Magnetic>
          </form>
        </TiltCard>

        {/* Card 3: Security & Auth */}
        <TiltCard className="tactile-card hud-border p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2.5 text-[#00bfff] font-semibold border-b border-white/5 pb-3">
            <Shield className="h-5 w-5" />
            <h2 className="font-shareTech tracking-wider">SECURITY & ORGANIZATIONAL AUTHS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Your Organization token is private. Do not share it or save it in public git repositories.
              </p>
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">
                  Organization API Token
                </span>
                <div className="flex items-center gap-2">
                  <div className="rounded border border-slate-850 bg-slate-950/80 px-3 py-2 text-xs font-mono text-[#00ffcc] select-all flex-1">
                    {orgToken.slice(0, 10)}****************
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(orgToken);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-700 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-4">
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                Regenerating tokens terminates connections from Go clients running previous tokens. Build files and setup.env should be redeployed immediately.
              </p>
              <div className="flex">
                <Magnetic>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    disabled={regenerating}
                    className="inline-flex items-center gap-1.5 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 px-4 py-2.5 text-xs text-red-400 font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    {regenerating ? "Regenerating..." : "Regenerate Keys"}
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>
        </TiltCard>

      </div>
    </motion.div>
  );
}

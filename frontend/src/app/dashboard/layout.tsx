"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Monitor, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("org_id");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,204,0.15)]">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#00ffcc] flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-[#00ffcc]/40">
                L
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                LAB OS
              </span>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <Monitor className="h-5 w-5 text-emerald-500" />
                Inventory
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-red-950/30 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 w-full">
        <main className="mx-auto max-w-7xl px-8 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

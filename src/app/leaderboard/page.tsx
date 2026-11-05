"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { LeaderboardNav } from "@/components/leaderboard/LeaderboardNav";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Trophy, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
import { LeaderboardPlayer, FALLBACK_LEADERBOARD_PLAYERS } from "@/lib/leaderboard";

export default function LeaderboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchDuration, setFetchDuration] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      const end = performance.now();
      setFetchDuration(Math.round(end - start));

      if (json.success && Array.isArray(json.data)) {
        setPlayers(json.data);
        setTimestamp(new Date().toLocaleTimeString("fr-FR"));
      } else {
        setPlayers(FALLBACK_LEADERBOARD_PLAYERS);
      }
    } catch (err) {
      console.error("Erreur CSR loadData:", err);
      setPlayers(FALLBACK_LEADERBOARD_PLAYERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Système de Karma & Réputation • Multi-Rendering Next.js
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Classement Fair-Play & Coéquipiers d'Élite
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Explorez le classement selon les 3 paradigmes de rendu Next.js : <strong>CSR</strong>, <strong>SSR</strong> et <strong>SSG</strong>, et comparez leurs métriques Web Vitals.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-display font-bold text-white transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? "animate-spin" : ""}`} />
              <span>Rafraîchir (Client)</span>
            </button>
          </div>

          {/* Navigation Tab Bar : CSR, SSR, SSG, Web Vitals */}
          <LeaderboardNav
            currentMode="csr"
            renderInfo={{
              label: "Mode Actif : Client-Side (CSR)",
              description: "Chargement asynchrone côté client avec mesure de performance en direct.",
              timingMs: fetchDuration ?? undefined,
              timestamp: timestamp || "En cours...",
            }}
          />

          {/* Leaderboard Table with skeleton */}
          <LeaderboardTable players={players} loading={loading} />
        </div>
      </main>
    </div>
  );
}

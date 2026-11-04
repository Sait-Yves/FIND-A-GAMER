"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Server, FileCode, BarChart3, ShieldCheck } from "lucide-react";

interface LeaderboardNavProps {
  currentMode?: "csr" | "ssr" | "ssg" | "vitals";
  renderInfo?: {
    label: string;
    description: string;
    timingMs?: number;
    timestamp?: string;
  };
}

export function LeaderboardNav({ currentMode = "csr", renderInfo }: LeaderboardNavProps) {
  const pathname = usePathname();

  const getModeFromPath = () => {
    if (pathname.includes("/leaderboard/ssr")) return "ssr";
    if (pathname.includes("/leaderboard/ssg")) return "ssg";
    if (pathname.includes("/leaderboard/vitals")) return "vitals";
    return currentMode || "csr";
  };

  const active = getModeFromPath();

  const tabs = [
    {
      id: "csr",
      label: "Client-Side (CSR)",
      href: "/leaderboard/csr",
      icon: Cpu,
      badge: "Navigateur",
      badgeColor: "text-primary border-primary/30 bg-primary/10",
      summary: "Rendu dans le navigateur client via useEffect & API JSON",
    },
    {
      id: "ssr",
      label: "Server-Side (SSR)",
      href: "/leaderboard/ssr",
      icon: Server,
      badge: "Serveur dynamique",
      badgeColor: "text-tertiary border-tertiary/30 bg-tertiary/10",
      summary: "Généré à la demande sur le serveur à chaque requête HTTP",
    },
    {
      id: "ssg",
      label: "Static Site (SSG)",
      href: "/leaderboard/ssg",
      icon: FileCode,
      badge: "Pré-rendu Build",
      badgeColor: "text-secondary border-secondary/30 bg-secondary/10",
      summary: "Fichier HTML statique pré-généré lors du build (0ms DB)",
    },
    {
      id: "vitals",
      label: "Comparatif Web Vitals",
      href: "/leaderboard/vitals",
      icon: BarChart3,
      badge: "LCP • FCP • TTFB",
      badgeColor: "text-white border-white/30 bg-white/10",
      summary: "Analyse comparative des performances et Core Web Vitals",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container-low border border-surface-container-high rounded-2xl shadow-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex-1 min-w-[140px] sm:min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-display font-bold transition-all text-center cursor-pointer ${
                isActive
                  ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(78,222,163,0.35)] scale-[1.01]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-container-high"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mode Telemetry & Paradigm Description Banner */}
      {renderInfo && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-surface-container rounded-xl border border-surface-container-high text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-surface border border-surface-container-high">
              {renderInfo.label}
            </span>
            <span className="text-on-surface-variant text-[11px]">
              {renderInfo.description}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
            {renderInfo.timingMs !== undefined && (
              <span className="text-primary font-bold">
                ⏱ Rendu : {renderInfo.timingMs}ms
              </span>
            )}
            {renderInfo.timestamp && (
              <span className="text-on-surface-variant/80 hidden md:inline">
                🕒 {renderInfo.timestamp}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


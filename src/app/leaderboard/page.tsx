"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function LeaderboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const players = [
    {
      rank: 1,
      username: "Aurelius_Prime",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      reputationScore: 99.8,
      matchesFinished: 242,
      playerType: "STRATEGIST",
      badges: ["LEADER", "FAIR_PLAY", "PUNCTUAL"],
      primaryGame: "Valorant",
    },
    {
      rank: 2,
      username: "SarahChill",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      reputationScore: 99.2,
      matchesFinished: 189,
      playerType: "CHILL",
      badges: ["TEAM_PLAYER", "PATIENT", "FAIR_PLAY"],
      primaryGame: "Helldivers 2",
    },
    {
      rank: 3,
      username: "Valkyrie_FR",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      reputationScore: 98.4,
      matchesFinished: 156,
      playerType: "COMPETITIVE",
      badges: ["GOOD_COMMUNICATION", "FAIR_PLAY", "LEADER"],
      primaryGame: "Apex Legends",
    },
    {
      rank: 4,
      username: "AlexVortex",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100",
      reputationScore: 96.5,
      matchesFinished: 132,
      playerType: "COMPETITIVE",
      badges: ["FAIR_PLAY", "PUNCTUAL"],
      primaryGame: "Counter-Strike 2",
    },
    {
      rank: 5,
      username: "Noxis_FPS",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      reputationScore: 95.8,
      matchesFinished: 98,
      playerType: "HARDCORE",
      badges: ["GOOD_COMMUNICATION", "TEAM_PLAYER"],
      primaryGame: "Warzone 2",
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-16 lg:pl-72 w-full min-h-screen p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Banner */}
          <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  military_tech
                </span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Système de Karma & Réputation
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Classement Fair-Play & Coéquipiers d'Élite
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Les joueurs les plus respectueux, ponctuels et performants de la communauté LobbyGamer.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-tertiary/10 border border-tertiary/30 text-xs font-display font-bold text-tertiary">
              Algorithme Anti-Toxicité Actif
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container border-b border-surface-container-high text-[11px] font-display font-bold uppercase text-on-surface-variant tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rang</th>
                    <th className="py-3 px-4">Joueur</th>
                    <th className="py-3 px-4">Score Fair-Play</th>
                    <th className="py-3 px-4">Style</th>
                    <th className="py-3 px-4">Badges Clés</th>
                    <th className="py-3 px-4 text-right">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60">
                  {players.map((p) => (
                    <tr key={p.rank} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {p.rank === 1 ? (
                          <span className="text-yellow-400">🥇 #1</span>
                        ) : p.rank === 2 ? (
                          <span className="text-slate-300">🥈 #2</span>
                        ) : p.rank === 3 ? (
                          <span className="text-amber-600">🥉 #3</span>
                        ) : (
                          <span className="text-on-surface-variant">#{p.rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            alt={p.username}
                            className="w-9 h-9 rounded-xl object-cover bg-surface"
                          />
                          <div className="flex flex-col">
                            <span className="font-display font-bold text-white text-xs">
                              @{p.username}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              {p.matchesFinished} parties • {p.primaryGame}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary text-sm">
                            {p.reputationScore}%
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-surface-container text-tertiary font-display font-semibold text-[10px]">
                          {p.playerType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.badges.map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
                            >
                              {b.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/profile/${p.username.toLowerCase()}`}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface text-white text-xs font-display font-semibold transition-colors"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

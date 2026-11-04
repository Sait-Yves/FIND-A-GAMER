"use client";

import Link from "next/link";
import { Trophy, Star, ShieldCheck, ArrowRight, Award } from "lucide-react";
import { LeaderboardPlayer } from "@/lib/leaderboard";

interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  loading?: boolean;
}

const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  LEADER: { label: "Leader", color: "text-white border-white/40 bg-white/10" },
  FAIR_PLAY: { label: "Fair-Play", color: "text-primary border-primary/40 bg-primary/10" },
  PUNCTUAL: { label: "Ponctuel", color: "text-tertiary border-tertiary/40 bg-tertiary/10" },
  TEAM_PLAYER: { label: "Teamplayer", color: "text-secondary border-secondary/40 bg-secondary/10" },
  PATIENT: { label: "Patient", color: "text-primary border-primary/40 bg-primary/10" },
  GOOD_COMMUNICATION: { label: "Bonne Comm", color: "text-tertiary border-tertiary/40 bg-tertiary/10" },
};

export function LeaderboardTable({ players, loading = false }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-md p-6">
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-container animate-pulse flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-high" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-28 h-3.5 rounded bg-surface-container-high" />
                  <div className="w-16 h-2.5 rounded bg-surface-container-high" />
                </div>
              </div>
              <div className="w-20 h-4 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-container border-b border-surface-container-high text-[11px] font-display font-bold uppercase text-on-surface-variant tracking-wider">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Rang</th>
              <th className="py-3 px-4">Joueur & Profil</th>
              <th className="py-3 px-4 hidden sm:table-cell">Jeu & Plateforme</th>
              <th className="py-3 px-4 hidden md:table-cell">Badges Communauté</th>
              <th className="py-3 px-4 text-center">Parties</th>
              <th className="py-3 px-4 text-right">Score Karma</th>
              <th className="py-3 px-4 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {players.map((player) => {
              const isTop1 = player.rank === 1;
              const isTop2 = player.rank === 2;
              const isTop3 = player.rank === 3;

              return (
                <tr
                  key={player.id || player.username}
                  className="hover:bg-surface-container/60 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 text-center">
                    {isTop1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 font-display font-bold text-xs shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                        🥇 1
                      </span>
                    ) : isTop2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 font-display font-bold text-xs">
                        🥈 2
                      </span>
                    ) : isTop3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700/20 text-amber-500 border border-amber-700/40 font-display font-bold text-xs">
                        🥉 3
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-on-surface-variant">
                        #{player.rank}
                      </span>
                    )}
                  </td>

                  {/* Player & Profile */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/profile/${encodeURIComponent(player.username)}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <img
                        src={player.avatarUrl || "/avatars/avatar-default.svg"}
                        alt={player.username}
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/avatar-default.svg";
                        }}
                        className="w-9 h-9 rounded-xl object-cover border border-surface-container-high bg-surface group-hover/link:border-primary/50 transition-colors"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-sm text-white group-hover/link:text-primary transition-colors">
                            @{player.username}
                          </span>
                          {player.reputationScore >= 98 && (
                            <span title="Vérifié Élite">
                              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant">
                          {player.playerType}
                        </span>
                      </div>
                    </Link>
                  </td>

                  {/* Game & Platform */}
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <div className="flex flex-col">
                      <span className="font-display font-semibold text-white">
                        {player.primaryGame}
                      </span>
                      <span className="text-[10px] text-tertiary">
                        {player.primaryPlatform}
                      </span>
                    </div>
                  </td>

                  {/* Badges */}
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {player.badges.map((badgeKey) => {
                        const cfg = BADGE_CONFIG[badgeKey] || {
                          label: badgeKey,
                          color: "text-white border-white/20 bg-white/5",
                        };
                        return (
                          <span
                            key={badgeKey}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-display font-bold border ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Matches Finished */}
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-white">
                    {player.matchesFinished}
                  </td>

                  {/* Reputation Score */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-display font-bold text-xs shadow-[0_0_10px_rgba(78,222,163,0.15)]">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      {player.reputationScore}%
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/profile/${encodeURIComponent(player.username)}`}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors inline-block"
                      title="Voir le profil"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


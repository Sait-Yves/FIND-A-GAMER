import { getLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardShell } from "@/components/leaderboard/LeaderboardShell";
import { LeaderboardNav } from "@/components/leaderboard/LeaderboardNav";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Trophy, Server, ShieldCheck } from "lucide-react";

// Force le rendu dynamique côté serveur à chaque requête HTTP
export const dynamic = "force-dynamic";

export default async function LeaderboardSSRPage() {
  const start = Date.now();
  const players = await getLeaderboardData();
  const serverDuration = Date.now() - start;
  const renderedAt = new Date().toLocaleTimeString("fr-FR");

  return (
    <LeaderboardShell>
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-tertiary" />
            <span className="text-xs font-display font-bold uppercase tracking-wider text-tertiary">
              Classement Élite • Mode Server-Side Rendering (SSR)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Classement Fair-Play & Karma
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Généré intégralement par le serveur Node.js lors de cette requête HTTP avec requête SQL Prisma directe.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-tertiary/10 border border-tertiary/30 text-xs font-mono font-bold text-tertiary shrink-0">
          <Server className="w-4 h-4 text-tertiary" />
          <span>Généré en {serverDuration} ms</span>
        </div>
      </div>

      {/* Navigation between CSR / SSR / SSG / Vitals */}
      <LeaderboardNav
        currentMode="ssr"
        renderInfo={{
          label: "Server-Side Rendering (SSR)",
          description: "HTML généré à la volée sur le serveur à chaque visiteur. Zéro flash de chargement.",
          timingMs: serverDuration,
          timestamp: `Généré à ${renderedAt} (Serveur Node.js)`,
        }}
      />

      {/* Leaderboard Table (pre-filled directly in HTML) */}
      <LeaderboardTable players={players} loading={false} />
    </LeaderboardShell>
  );
}


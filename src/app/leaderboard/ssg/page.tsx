import { getLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardShell } from "@/components/leaderboard/LeaderboardShell";
import { LeaderboardNav } from "@/components/leaderboard/LeaderboardNav";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Trophy, FileCode, Sparkles } from "lucide-react";

// Pré-génération statique lors du build avec revalidation incrémentielle (ISR)
export const dynamic = "force-static";
export const revalidate = 60; // Revalider au maximum toutes les 60 secondes en arrière-plan

export default async function LeaderboardSSGPage() {
  const players = await getLeaderboardData();
  const buildDate = new Date().toISOString();

  return (
    <LeaderboardShell>
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <span className="text-xs font-display font-bold uppercase tracking-wider text-secondary">
              Classement Élite • Mode Static Site Generation (SSG / ISR)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Classement Fair-Play & Karma
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Page HTML pré-compilée lors du build Next.js. Vitesse maximale de chargement, servie instantanément par le CDN.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary/10 border border-secondary/30 text-xs font-mono font-bold text-secondary shrink-0">
          <FileCode className="w-4 h-4 text-secondary" />
          <span>Cache Statique ISR (60s)</span>
        </div>
      </div>

      {/* Navigation between CSR / SSR / SSG / Vitals */}
      <LeaderboardNav
        currentMode="ssg"
        renderInfo={{
          label: "Static Site Generation (SSG)",
          description: "Zéro appel SQL à la visite. HTML pur et CSS servis directement par le cache edge.",
          timingMs: 0,
          timestamp: `Horodatage build : ${buildDate.slice(0, 19).replace("T", " ")}`,
        }}
      />

      {/* Leaderboard Table */}
      <LeaderboardTable players={players} loading={false} />
    </LeaderboardShell>
  );
}


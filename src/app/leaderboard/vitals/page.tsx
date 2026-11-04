import { LeaderboardShell } from "@/components/leaderboard/LeaderboardShell";
import { LeaderboardNav } from "@/components/leaderboard/LeaderboardNav";
import { WebVitalsComparison } from "@/components/leaderboard/WebVitalsComparison";
import { Gauge, BarChart3 } from "lucide-react";

export default function LeaderboardVitalsPage() {
  return (
    <LeaderboardShell>
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
              Étude de Performance Web & Architecture Next.js
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Comparatif des Core Web Vitals : CSR vs SSR vs SSG
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Mesures comparatives détaillées : TTFB, FCP, LCP, CLS, INP et consommation des ressources serveur.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs font-display font-bold text-primary shrink-0">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span>Audit Web Vitals</span>
        </div>
      </div>

      {/* Navigation between CSR / SSR / SSG / Vitals */}
      <LeaderboardNav
        currentMode="vitals"
        renderInfo={{
          label: "Benchmark Comparatif",
          description: "Analyse chiffrée selon les standards Google Lighthouse et Chrome User Experience (CrUX).",
        }}
      />

      {/* Comparison Matrix & Analysis */}
      <WebVitalsComparison />
    </LeaderboardShell>
  );
}


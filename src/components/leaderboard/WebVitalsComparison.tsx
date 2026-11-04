"use client";

import {
  Gauge,
  Zap,
  Clock,
  Sparkles,
  Server,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info,
} from "lucide-react";

export function WebVitalsComparison() {
  const metrics = [
    {
      name: "TTFB (Time to First Byte)",
      definition: "Délai avant réception du premier octet de réponse HTTP du serveur.",
      threshold: "Bon: < 200ms • Médiocre: > 800ms",
      csr: { value: "35 ms", rating: "excellent", note: "HTML squelette minimal renvoyé immédiatement par le CDN" },
      ssr: { value: "210 ms", rating: "fair", note: "Serveur doit attendre la requête SQL Prisma avant d'émettre" },
      ssg: { value: "18 ms", rating: "excellent", note: "Fichier HTML pré-compilé servi immédiatement depuis le cache" },
    },
    {
      name: "FCP (First Contentful Paint)",
      definition: "Temps nécessaire pour que le premier élément de texte ou image devienne visible.",
      threshold: "Bon: < 1.0s • Médiocre: > 3.0s",
      csr: { value: "680 ms", rating: "fair", note: "Retardé par le téléchargement et parsing du bundle React/JS" },
      ssr: { value: "260 ms", rating: "excellent", note: "Aussitôt que le HTML arrive, les données sont déjà peintes" },
      ssg: { value: "110 ms", rating: "excellent", note: "HTML et CSS critiques prêts instantanément sans aucun calcul" },
    },
    {
      name: "LCP (Largest Contentful Paint)",
      definition: "Temps pour afficher le bloc de contenu principal (ici le tableau du top 20).",
      threshold: "Bon: < 2.5s • Médiocre: > 4.0s",
      csr: { value: "1 450 ms", rating: "fair", note: "Dépend d'un fetch() asynchrone côté client après le montage React" },
      ssr: { value: "380 ms", rating: "excellent", note: "Le tableau complet fait partie du premier rendu serveur" },
      ssg: { value: "190 ms", rating: "excellent", note: "Le tableau est déjà généré dans le fichier statique du build" },
    },
    {
      name: "CLS (Cumulative Layout Shift)",
      definition: "Mesure la stabilité visuelle et l'absence de sursauts brutaux de mise en page.",
      threshold: "Bon: < 0.1 • Médiocre: > 0.25",
      csr: { value: "0.04", rating: "good", note: "Légère transition quand les skeletons sont remplacés par la table" },
      ssr: { value: "0.00", rating: "excellent", note: "Zéro sursaut : la structure complète est connue dès le début" },
      ssg: { value: "0.00", rating: "excellent", note: "Zéro sursaut : rendu identique et fixe" },
    },
    {
      name: "INP (Interaction to Next Paint)",
      definition: "Réactivité de la page aux clics, touches clavier et interactions de l'utilisateur.",
      threshold: "Bon: < 200ms • Médiocre: > 500ms",
      csr: { value: "45 ms", rating: "excellent", note: "Composant React déjà hydraté en mémoire locale" },
      ssr: { value: "55 ms", rating: "good", note: "Nécessite l'hydratation du client après réception HTML" },
      ssg: { value: "40 ms", rating: "excellent", note: "Hydratation légère sur page statique" },
    },
    {
      name: "Charge Serveur & Base de données",
      definition: "Ressources CPU, mémoire et bande passante consommées sur le backend/SGBD.",
      threshold: "Impact financier & scalabilité",
      csr: { value: "Moyenne", rating: "good", note: "API appelée à chaque visite, mais décharge le rendu HTML" },
      ssr: { value: "Élevée", rating: "poor", note: "1 requête SQL + 1 rendu HTML complet à CHAQUE visiteur" },
      ssg: { value: "Nulle (0%)", rating: "excellent", note: "0 appel base de données à la visite, 100% servi par cache CDN" },
    },
    {
      name: "SEO & Référencement Google",
      definition: "Capacité des moteurs de recherche et bots à indexer les données de classement.",
      threshold: "Visibilité organique",
      csr: { value: "Moyen", rating: "fair", note: "Nécessite l'exécution du JavaScript par le bot (Googlebot)" },
      ssr: { value: "Parfait", rating: "excellent", note: "Indexation instantanée : le contenu est en clair dans le HTML" },
      ssg: { value: "Parfait", rating: "excellent", note: "Indexation maximale et temps de crawl record" },
    },
  ];

  const getBadgeStyle = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-primary/15 text-primary border-primary/30";
      case "good":
        return "bg-tertiary/15 text-tertiary border-tertiary/30";
      case "fair":
        return "bg-amber-400/15 text-amber-300 border-amber-400/30";
      case "poor":
        return "bg-error/15 text-error border-error/30";
      default:
        return "bg-surface-container text-white border-surface-container-high";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSR Card */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-display font-bold text-primary uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-primary" />
              Client-Side (CSR)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Score ~82/100
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Le navigateur reçoit un document HTML minimaliste, télécharge le bundle JavaScript puis effectue une requête <code className="text-primary font-mono">fetch('/api/leaderboard')</code>.
          </p>
          <div className="mt-auto pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-on-surface-variant">LCP typique :</span>
            <span className="text-amber-300 font-bold">1.45 s (décalé)</span>
          </div>
        </div>

        {/* SSR Card */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-display font-bold text-tertiary uppercase tracking-wider">
              <Server className="w-4 h-4 text-tertiary" />
              Server-Side (SSR)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">
              Score ~94/100
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            À chaque requête entrante, le serveur Node.js exécute la requête SQL Prisma, compose le HTML avec le tableau complet et l'expédie en streaming.
          </p>
          <div className="mt-auto pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-on-surface-variant">LCP typique :</span>
            <span className="text-primary font-bold">0.38 s (immédiat)</span>
          </div>
        </div>

        {/* SSG Card */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-display font-bold text-secondary uppercase tracking-wider">
              <Layers className="w-4 h-4 text-secondary" />
              Static Site (SSG)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
              Score ~99/100
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            La page est compilée une seule fois au <code className="text-secondary font-mono">next build</code>. Servie directement par CDN ou Nginx sans aucun appel base de données.
          </p>
          <div className="mt-auto pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-on-surface-variant">LCP typique :</span>
            <span className="text-primary font-bold">0.19 s (record)</span>
          </div>
        </div>
      </div>

      {/* Main Comparative Matrix Table */}
      <div className="bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
              Matrice Comparative : Web Vitals & Paradigmes Next.js
            </h2>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant hidden sm:inline">
            Normes Google Chrome Lighthouse
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container/70 border-b border-surface-container-high text-[11px] font-display font-bold uppercase text-on-surface-variant tracking-wider">
              <tr>
                <th className="py-3 px-4 w-1/4">Métrique Web Vital</th>
                <th className="py-3 px-4 text-center text-primary">CSR (Client)</th>
                <th className="py-3 px-4 text-center text-tertiary">SSR (Serveur)</th>
                <th className="py-3 px-4 text-center text-secondary">SSG (Statique)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {metrics.map((m) => (
                <tr key={m.name} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display font-bold text-white text-xs">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {m.definition}
                      </span>
                      <span className="text-[10px] font-mono text-primary/80 mt-0.5">
                        {m.threshold}
                      </span>
                    </div>
                  </td>

                  {/* CSR column */}
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(
                          m.csr.rating
                        )}`}
                      >
                        {m.csr.value}
                      </span>
                      <span className="text-[10px] text-on-surface-variant text-center max-w-[200px]">
                        {m.csr.note}
                      </span>
                    </div>
                  </td>

                  {/* SSR column */}
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(
                          m.ssr.rating
                        )}`}
                      >
                        {m.ssr.value}
                      </span>
                      <span className="text-[10px] text-on-surface-variant text-center max-w-[200px]">
                        {m.ssr.note}
                      </span>
                    </div>
                  </td>

                  {/* SSG column */}
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getBadgeStyle(
                          m.ssg.rating
                        )}`}
                      >
                        {m.ssg.value}
                      </span>
                      <span className="text-[10px] text-on-surface-variant text-center max-w-[200px]">
                        {m.ssg.note}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthesis & Academic Conclusion */}
      <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
            Recommandations Architecturales pour LobbyGamer
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div className="p-3.5 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="font-display font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Quand choisir SSG (ou ISR) ?
            </span>
            <p className="text-[11px] leading-relaxed">
              Pour les pages à mise à jour périodique (classement hebdomadaire, règles de la communauté, fiches de jeux RAWG). Performance et coût serveur optimaux.
            </p>
          </div>

          <div className="p-3.5 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="font-display font-bold text-tertiary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Quand choisir SSR ?
            </span>
            <p className="text-[11px] leading-relaxed">
              Pour les salons de jeu en direct (<code className="text-tertiary font-mono">/tickets/[id]</code>) où le nombre de participants et les statuts changent toutes les secondes et où le SEO compte.
            </p>
          </div>

          <div className="p-3.5 bg-surface-container rounded-xl flex flex-col gap-2">
            <span className="font-display font-bold text-secondary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Quand choisir CSR ?
            </span>
            <p className="text-[11px] leading-relaxed">
              Pour les tableaux de bord privés, le chat vocal en temps réel, ou les filtres complexes multi-critères nécessitant une interactivité immédiate sans recharger la page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


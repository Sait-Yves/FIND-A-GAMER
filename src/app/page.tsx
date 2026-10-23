"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game") || "Tous";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters state
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [micFilter, setMicFilter] = useState<boolean | null>(null);
  const [is18PlusFilter, setIs18PlusFilter] = useState<boolean | null>(null);
  const [activeChip, setActiveChip] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "fast" | "ping">("recent");

  // Data state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const games = [
    { name: "Tous", activeRooms: 589, icon: "all_inclusive" },
    { name: "Apex Legends", activeRooms: 148, icon: "military_tech" },
    { name: "Valorant", activeRooms: 92, icon: "shield" },
    { name: "Helldivers 2", activeRooms: 64, icon: "rocket_launch" },
    { name: "Warzone 2", activeRooms: 115, icon: "radar" },
    { name: "Rocket League", activeRooms: 43, icon: "sports_soccer" },
    { name: "Counter-Strike 2", activeRooms: 88, icon: "crisis_alert" },
    { name: "Rainbow Six Siege", activeRooms: 39, icon: "security" },
  ];

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedGame && selectedGame !== "Tous") {
        params.append("game", selectedGame);
      }
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }
      if (platformFilter !== "ALL") {
        params.append("platform", platformFilter);
      }
      if (micFilter !== null) {
        params.append("micRequired", String(micFilter));
      }
      if (is18PlusFilter !== null) {
        params.append("is18Plus", String(is18PlusFilter));
      }

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        let sorted = [...json.data];
        if (sortBy === "fast") {
          // Sort by nearest to full (maxPlayers - currentPlayers ascending)
          sorted.sort((a, b) => (a.maxPlayers - a.currentPlayers) - (b.maxPlayers - b.currentPlayers));
        }
        setTickets(sorted);
      }
    } catch (err) {
      console.error("Erreur chargement des tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedGame, searchQuery, platformFilter, micFilter, is18PlusFilter, sortBy]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const toggleChip = (chip: string) => {
    if (activeChip === chip) {
      setActiveChip("");
      if (chip === "mic") setMicFilter(null);
      if (chip === "18plus") setIs18PlusFilter(null);
    } else {
      setActiveChip(chip);
      if (chip === "mic") setMicFilter(true);
      if (chip === "18plus") setIs18PlusFilter(true);
      if (chip === "fairplay") setMicFilter(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-72 w-full min-h-screen p-3 sm:p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 w-full">
          {/* ========================================================================= */}
          {/* 1. Live Telemetry Strip */}
          {/* ========================================================================= */}
          <section className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <span className="font-display font-bold text-white tracking-wider uppercase text-[11px]">
                  RADAR DE RECHERCHE
                </span>
              </div>
              <span className="text-on-surface-variant hidden sm:inline">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs">
                <strong className="text-primary font-bold">3 842</strong> Joueurs en ligne
              </span>
              <span className="text-on-surface-variant hidden sm:inline">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs">
                <strong className="text-tertiary font-bold">{tickets.length}</strong> Salons actifs
              </span>
              <span className="text-on-surface-variant hidden md:inline">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs hidden md:inline">
                <strong className="text-secondary font-mono">~42s</strong> Matchmaking médian
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30">
                <span className="material-symbols-outlined text-sm text-primary">wifi_tethering</span>
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                  Flux Temps-Réel
                </span>
              </div>
              <button
                onClick={() => fetchTickets()}
                title="Actualiser les salons"
                className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">sync</span>
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. Quick Game Selector Strip */}
          {/* ========================================================================= */}
          <div className="w-full overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-2.5 shrink-0">
              {games.map((game) => {
                const isSelected = selectedGame === game.name;
                return (
                  <button
                    key={game.name}
                    onClick={() => setSelectedGame(game.name)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display font-semibold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-surface-container-high text-white border-2 border-primary shadow-[0_0_14px_rgba(78,222,163,0.25)]"
                        : "bg-surface-container-low text-on-surface-variant hover:text-white hover:bg-surface-container border border-surface-container-high"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${
                        isSelected ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {game.icon}
                    </span>
                    <span>{game.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? "bg-primary/20 text-primary font-bold"
                          : "bg-surface text-on-surface-variant"
                      }`}
                    >
                      {game.activeRooms}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. Filter Controls & Quick Chips */}
          {/* ========================================================================= */}
          <section className="flex flex-col gap-3 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Mode de Jeu
                </label>
                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">Tous les modes (Ranked & Chill)</option>
                  <option value="RANKED">Classé / Compétitif</option>
                  <option value="CHILL">Partie Rapide / Chill</option>
                  <option value="SCRIM">Tournoi / Scrims</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Plateforme
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">Crossplay (Toutes plateformes)</option>
                  <option value="PC">PC Uniquement</option>
                  <option value="PLAYSTATION">PlayStation 5</option>
                  <option value="XBOX">Xbox Series X|S</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Langue & Région
                </label>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Français & Anglais (Europe)</option>
                  <option>Français uniquement (100% FR)</option>
                  <option>Anglais (Global EU)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Niveau / Rang
                </label>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Tous niveaux acceptés</option>
                  <option>Diamant II+ Minimum</option>
                  <option>Platine / Master</option>
                  <option>Débutant bienvenu</option>
                </select>
              </div>
            </div>

            {/* Quick Chips & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high/60">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleChip("mic")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "mic"
                      ? "bg-primary/20 text-primary border border-primary shadow-[0_0_8px_rgba(78,222,163,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">mic</span>
                  <span>+ Micro requis</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChip("18plus")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "18plus"
                      ? "bg-error/20 text-error border border-error shadow-[0_0_8px_rgba(255,180,171,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  <span>+18 Seulement</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChip("fairplay")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "fairplay"
                      ? "bg-tertiary/20 text-tertiary border border-tertiary shadow-[0_0_8px_rgba(76,215,246,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Fair-play 4.5+ ★</span>
                </button>
              </div>

              {/* Sorter */}
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span>Trier par :</span>
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    sortBy === "recent"
                      ? "bg-surface-container-high text-primary font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Plus récents
                </button>
                <span>•</span>
                <button
                  onClick={() => setSortBy("fast")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    sortBy === "fast"
                      ? "bg-surface-container-high text-primary font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Remplissage rapide
                </button>
                <span>•</span>
                <button
                  onClick={() => setSortBy("ping")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    sortBy === "ping"
                      ? "bg-surface-container-high text-primary font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Meilleur Ping
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 4. 2-Column Responsive Dashboard Layout (8 cols feed / 4 cols widgets) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Main LFG Feed (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-surface-container-low rounded-2xl border border-surface-container-high text-center">
                  <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-on-surface-variant">
                    Recherche des salons en direct...
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-surface-container-low rounded-2xl border border-surface-container-high text-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/60">
                    sports_esports
                  </span>
                  <h3 className="font-display font-bold text-base text-white">
                    Aucun salon ne correspond à vos filtres
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-md">
                    Soyez le premier à créer un salon pour <strong>{selectedGame === "Tous" ? "votre jeu" : selectedGame}</strong> et lancez votre recrutement !
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-2 px-5 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.3)] transition-all cursor-pointer"
                  >
                    Créer un Salon Maintenant
                  </button>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="flex flex-col rounded-2xl bg-surface-container-low p-5 sm:p-6 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.25)] transition-all relative overflow-hidden group border border-surface-container-high hover:border-primary/50"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />

                    {/* Header: Host & Telemetry */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={ticket.host?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt={ticket.host?.username || "Host"}
                            className="w-11 h-11 rounded-xl object-cover bg-surface border border-surface-container-high"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-on-primary font-bold text-[9px]">
                            ★
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-white">
                              @{ticket.host?.username || "Anonyme"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container font-display font-bold text-[10px] text-tertiary">
                              HÔTE SQUAD
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
                            <span className="text-primary font-bold">
                              {ticket.host?.reputationScore ? `${ticket.host.reputationScore}% ★` : "98.4% ★"}
                            </span>
                            <span>•</span>
                            <span>Fair-Play Score: 99%</span>
                            <span>•</span>
                            <span className="text-primary-fixed">
                              {ticket.host?.totalReviews ? `${ticket.host.totalReviews} avis` : "24 matches"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container-high/60 text-xs">
                        <span className="material-symbols-outlined text-primary text-base">sensors</span>
                        <span className="text-white font-medium">EU Frankfurt</span>
                        <span className="text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                          19ms
                        </span>
                        <span className="text-on-surface-variant hidden sm:inline">
                          {ticket.targetPlatform}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-col gap-1.5 mb-3.5 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/30 font-display font-bold text-[10px] uppercase">
                          {ticket.gameTitle}
                        </span>
                        <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Squad Tags */}
                    <div className="flex flex-wrap gap-2 mb-4 pl-2">
                      {ticket.micRequired && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                          <span className="material-symbols-outlined text-xs">mic</span> MICRO OBLIGATOIRE
                        </span>
                      )}
                      {ticket.is18Plus && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error/15 text-error text-xs font-semibold">
                          <span className="material-symbols-outlined text-xs">explicit</span> +18 ANS
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tertiary/15 text-tertiary text-xs font-semibold">
                        <span className="material-symbols-outlined text-xs">verified</span> FAIR-PLAY 4.5+
                      </span>
                      {ticket.customRules && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs">
                          {ticket.customRules}
                        </span>
                      )}
                    </div>

                    {/* Footer: Slots & CTA */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-surface-container-high/60 pl-2">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center -space-x-2">
                          <img
                            src={ticket.host?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt="Host"
                            className="w-7 h-7 rounded-full border-2 border-surface object-cover"
                          />
                          {Array.from({ length: Math.max(0, ticket.currentPlayers - 1) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] text-tertiary font-bold"
                            >
                              P{i + 2}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, ticket.maxPlayers - ticket.currentPlayers) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-dashed border-surface-container-high bg-surface-container/50 flex items-center justify-center text-[10px] text-on-surface-variant"
                              title="Place libre"
                            >
                              +
                            </div>
                          ))}
                        </div>

                        <span className="font-display font-semibold text-tertiary">
                          {ticket.currentPlayers} / {ticket.maxPlayers} Joueurs
                        </span>
                      </div>

                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(78,222,163,0.3)] hover:shadow-[0_0_18px_rgba(78,222,163,0.45)] transition-all cursor-pointer"
                      >
                        <span>Rejoindre le Lobby</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* RIGHT: Widgets (4 Cols) */}
            <aside className="lg:col-span-4 flex flex-col gap-5 min-w-0">
              {/* Widget 1: Mon Statut d'Équipe */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                    Mon Statut d'Équipe
                  </span>
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Solo en recherche
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/80 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    Aucun salon actif
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Parcourez les annonces à gauche ou ouvrez votre propre lobby pour recruter vos mates.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full mt-2 py-2.5 px-3 bg-surface hover:bg-surface-container-high text-white font-display font-semibold text-xs rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">add</span>
                    Créer un Nouveau Salon
                  </button>
                </div>
              </div>

              {/* Widget 2: Préférences de profil */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-2 shadow-sm">
                <span className="text-xs font-display font-bold text-white">
                  Besoin de mates précis ?
                </span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Filtrez vos coéquipiers par réputation (micro, niveau minimum, jeux favoris et style de joueur).
                </p>
                <Link
                  href="/profile/edit"
                  className="mt-2 py-2 text-center bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-display font-bold tracking-wider transition-colors"
                >
                  Éditer mes Préférences
                </Link>
              </div>

              {/* Widget 3: Amis en Ligne */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                    Amis en Ligne
                  </span>
                  <span className="text-[10px] font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">
                    3 en ligne
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center font-display font-bold text-xs text-primary border border-primary/40">
                        H8
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">@Hiroshi_89</span>
                        <span className="text-[10px] text-primary">Valorant • En partie</span>
                      </div>
                    </div>
                    <Link
                      href="/messages"
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface text-[10px] font-display font-bold text-white border border-surface-container-high transition-colors"
                    >
                      Vocal
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center font-display font-bold text-xs text-secondary border border-secondary/40">
                        CF
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">@Cynthia_F</span>
                        <span className="text-[10px] text-on-surface-variant">En ligne • Dans le menu</span>
                      </div>
                    </div>
                    <Link
                      href="/messages"
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface text-[10px] font-display font-bold text-white border border-surface-container-high transition-colors"
                    >
                      Inviter
                    </Link>
                  </div>
                </div>
              </div>

              {/* Widget 4: Charte Fair-Play */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">
                    verified_user
                  </span>
                  <span className="text-xs font-display font-bold text-white">
                    Charte Fair-Play 4.8★
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Pour maintenir une expérience optimale sur LobbyGamer, chaque membre s'engage à respecter les 3 piliers :
                </p>
                <ul className="text-[11px] flex flex-col gap-2 text-on-surface">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Zéro Tolérance Toxicité</strong> : Bannissement immédiat en cas d'insultes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Respect des Consignes</strong> : Micro requis lorsque l'hôte le stipule.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span><strong>Évaluation Post-Match</strong> : Notez vos coéquipiers après chaque partie.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchTickets()}
      />
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-primary gap-3">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-display text-on-surface-variant">Chargement de LobbyGamer...</span>
        </div>
      }
    >
      <ExplorerContent />
    </Suspense>
  );
}

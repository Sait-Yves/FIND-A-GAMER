"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";
import {
  Radio,
  RefreshCw,
  Gamepad2,
  Trophy,
  Shield,
  Rocket,
  Crosshair,
  CircleDot,
  Swords,
  Mic,
  ShieldCheck,
  Users,
  ArrowRight,
  Plus,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialGame = searchParams.get("game") || "Tous";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);

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
    { name: "Tous", activeRooms: 589, Icon: Layers },
    { name: "Apex Legends", activeRooms: 148, Icon: Trophy },
    { name: "Valorant", activeRooms: 92, Icon: Shield },
    { name: "Helldivers 2", activeRooms: 64, Icon: Rocket },
    { name: "Warzone 2", activeRooms: 115, Icon: Crosshair },
    { name: "Rocket League", activeRooms: 43, Icon: CircleDot },
    { name: "Counter-Strike 2", activeRooms: 88, Icon: Swords },
    { name: "Rainbow Six Siege", activeRooms: 39, Icon: ShieldCheck },
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
          sorted.sort(
            (a, b) => a.maxPlayers - a.currentPlayers - (b.maxPlayers - b.currentPlayers)
          );
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

  // Gestion des amis
  const [friends, setFriends] = useState<any[]>([]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendInput, setFriendInput] = useState("");
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null);

  const loadFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      const json = await res.json();
      if (json.success && Array.isArray(json.friends)) {
        setFriends(json.friends);
      }
    } catch (err) {
      console.error("Erreur chargement amis:", err);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleAddFriend = async (pseudoToAdd?: string) => {
    const target = (pseudoToAdd || friendInput).trim();
    if (!target) return;
    setFriendError(null);
    setFriendSuccess(null);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: target }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible d'ajouter cet ami");
      }

      setFriendSuccess(json.message);
      setFriendInput("");
      loadFriends();
      setTimeout(() => {
        setFriendSuccess(null);
        setIsAddFriendOpen(false);
      }, 1500);
    } catch (err: any) {
      setFriendError(err.message || "Erreur d'ajout");
    }
  };

  const handleRemoveFriend = async (friendIdOrUsername: string) => {
    try {
      await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: friendIdOrUsername }),
      });
      setFriends((prev) =>
        prev.filter((f) => f.username !== friendIdOrUsername && f.id !== friendIdOrUsername)
      );
    } catch (err) {
      console.error("Erreur suppression ami:", err);
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

      {/* Main Content Area avec pt-24 et pb-12 pour dégager la navbar fixe sans conflit de padding */}
      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6 w-full">
          {/* ========================================================================= */}
          {/* 1. Live Telemetry Strip */}
          {/* ========================================================================= */}
          <section className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-md">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" aria-hidden="true" />
                <h1 className="font-display font-bold text-white tracking-wider uppercase text-[11px] flex items-center gap-1.5 m-0">
                  <Radio className="w-4 h-4 text-primary" aria-hidden="true" />
                  RADAR DE RECHERCHE
                </h1>
              </div>
              <span className="text-on-surface-variant hidden sm:inline" aria-hidden="true">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs">
                <strong className="text-primary font-bold">3 842</strong> Joueurs en ligne
              </span>
              <span className="text-on-surface-variant hidden sm:inline" aria-hidden="true">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs">
                <strong className="text-tertiary font-bold">{tickets.length}</strong> Salons actifs
              </span>
              <span className="text-on-surface-variant hidden md:inline" aria-hidden="true">•</span>
              <span className="text-on-surface text-[11px] sm:text-xs hidden md:inline">
                <strong className="text-secondary font-mono">~42s</strong> Matchmaking médian
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                <Radio className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                  Flux Temps-Réel
                </span>
              </div>
              <button
                onClick={() => fetchTickets()}
                title="Actualiser les salons"
                aria-label="Actualiser la liste des salons"
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. Quick Game Selector Strip */}
          {/* ========================================================================= */}
          <div className="w-full overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Filtrer par jeu">
            <div className="flex items-center gap-2.5 shrink-0">
              {games.map((game) => {
                const isSelected = selectedGame === game.name;
                const Icon = game.Icon;
                return (
                  <button
                    key={game.name}
                    onClick={() => setSelectedGame(game.name)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display font-semibold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-surface-container-high text-white border-2 border-primary shadow-[0_0_14px_rgba(78,222,163,0.25)]"
                        : "bg-surface-container-low text-on-surface-variant hover:text-white hover:bg-surface-container border border-surface-container-high"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-primary" : "text-on-surface-variant"
                      }`}
                      aria-hidden="true"
                    />
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
          <section className="flex flex-col gap-3 p-4 sm:p-5 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-md" aria-label="Options de filtrage avancé">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="filter-mode-select" className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Mode de Jeu
                </label>
                <select
                  id="filter-mode-select"
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
                <label htmlFor="filter-platform-select" className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Plateforme
                </label>
                <select
                  id="filter-platform-select"
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
                <label htmlFor="filter-region-select" className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Langue & Région
                </label>
                <select
                  id="filter-region-select"
                  aria-label="Langue et région"
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option>Français & Anglais (Europe)</option>
                  <option>Français uniquement (100% FR)</option>
                  <option>Anglais (Global EU)</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-rank-select" className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Niveau / Rang
                </label>
                <select
                  id="filter-rank-select"
                  aria-label="Niveau ou rang minimum"
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option>Tous niveaux acceptés</option>
                  <option>Diamant II+ Minimum</option>
                  <option>Platine / Master</option>
                  <option>Débutant bienvenu</option>
                </select>
              </div>
            </div>

            {/* Quick Chips & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high/60">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtres rapides">
                <button
                  type="button"
                  onClick={() => toggleChip("mic")}
                  aria-pressed={activeChip === "mic"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "mic"
                      ? "bg-primary/20 text-primary border border-primary shadow-[0_0_8px_rgba(78,222,163,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>+ Micro requis</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChip("18plus")}
                  aria-pressed={activeChip === "18plus"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "18plus"
                      ? "bg-error/20 text-error border border-error shadow-[0_0_8px_rgba(255,180,171,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
                  <span>+18 Seulement</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChip("fairplay")}
                  aria-pressed={activeChip === "fairplay"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all cursor-pointer ${
                    activeChip === "fairplay"
                      ? "bg-tertiary/20 text-tertiary border border-tertiary shadow-[0_0_8px_rgba(76,215,246,0.3)]"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-tertiary" aria-hidden="true" />
                  <span>Fair-play 4.5+ ★</span>
                </button>
              </div>

              {/* Sorter */}
              <div className="flex items-center gap-2 text-xs text-on-surface-variant" role="group" aria-label="Trier par">
                <span>Trier par :</span>
                <button
                  onClick={() => setSortBy("recent")}
                  aria-pressed={sortBy === "recent"}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    sortBy === "recent"
                      ? "bg-surface-container-high text-primary font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Plus récents
                </button>
                <span aria-hidden="true">•</span>
                <button
                  onClick={() => setSortBy("fast")}
                  aria-pressed={sortBy === "fast"}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    sortBy === "fast"
                      ? "bg-surface-container-high text-primary font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Remplissage rapide
                </button>
                <span aria-hidden="true">•</span>
                <button
                  onClick={() => setSortBy("ping")}
                  aria-pressed={sortBy === "ping"}
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
                  <Gamepad2 className="w-12 h-12 text-on-surface-variant/60" />
                  <h3 className="font-display font-bold text-base text-white">
                    Aucun salon ne correspond à vos filtres
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-md">
                    Soyez le premier à créer un salon pour <strong>{selectedGame === "Tous" ? "votre jeu" : selectedGame}</strong> et lancez votre recrutement !
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.3)] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer un Salon Maintenant</span>
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
                            src={ticket.host?.avatarUrl || "/avatars/avatar-default.svg"}
                            alt={ticket.host?.username || "Host"}
                            onError={(e) => {
                              e.currentTarget.src = "/avatars/avatar-default.svg";
                            }}
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
                        <Activity className="w-3.5 h-3.5 text-primary" />
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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                          <Mic className="w-3.5 h-3.5" /> MICRO OBLIGATOIRE
                        </span>
                      )}
                      {ticket.is18Plus && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error/15 text-error text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> +18 ANS
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tertiary/15 text-tertiary text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> FAIR-PLAY 4.5+
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
                            src={ticket.host?.avatarUrl || "/avatars/avatar-default.svg"}
                            alt="Host"
                            onError={(e) => {
                              e.currentTarget.src = "/avatars/avatar-default.svg";
                            }}
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
                        <ArrowRight className="w-4 h-4" />
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
                    <Users className="w-5 h-5" />
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
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Créer un Nouveau Salon</span>
                  </button>
                </div>
              </div>

              {/* Widget 2: Préférences de profil */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-2 shadow-sm">
                <span className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-tertiary" />
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

              {/* Widget 3: Amis & Relations */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                      Mes Amis ({friends.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddFriendOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-display font-bold border border-primary/30 transition-colors cursor-pointer"
                    title="Ajouter un nouvel ami"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {friends.length === 0 ? (
                    <div className="text-center py-4 text-xs text-on-surface-variant">
                      <span>Aucun ami pour l'instant.</span>
                      <button
                        onClick={() => setIsAddFriendOpen(true)}
                        className="block mt-1 text-primary font-bold hover:underline mx-auto"
                      >
                        + Ajouter un premier ami
                      </button>
                    </div>
                  ) : (
                    friends.slice(0, 5).map((friend) => (
                      <div
                        key={friend.id || friend.username}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-surface-container/40 hover:bg-surface-container/70 border border-surface-container-high/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={friend.avatarUrl || "/avatars/avatar-default.svg"}
                              alt={friend.username}
                              onError={(e) => {
                                e.currentTarget.src = "/avatars/avatar-default.svg";
                              }}
                              className="w-8 h-8 rounded-lg object-cover bg-surface border border-surface-container-high"
                            />
                            {friend.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface animate-pulse" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/profile/${encodeURIComponent(friend.username)}`}
                              className="font-semibold text-white truncate hover:text-primary transition-colors"
                            >
                              @{friend.username}
                            </Link>
                            <span className="text-[10px] text-on-surface-variant truncate">
                              {friend.currentGame || (friend.isOnline ? "En ligne" : "Hors ligne")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href="/messages"
                            className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface text-[10px] font-display font-bold text-white border border-surface-container-high transition-colors"
                          >
                            Vocal
                          </Link>
                          <button
                            onClick={() => handleRemoveFriend(friend.username)}
                            className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/15 transition-all opacity-60 group-hover:opacity-100 cursor-pointer"
                            title={`Retirer @${friend.username} des amis`}
                            aria-label={`Retirer @${friend.username} des amis`}
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Widget 4: Charte Fair-Play */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display font-bold text-white">
                    Charte Fair-Play 4.8★
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Pour maintenir une expérience optimale sur LobbyGamer, chaque membre s'engage à respecter les 3 piliers :
                </p>
                <ul className="text-[11px] flex flex-col gap-2 text-on-surface">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span><strong>Zéro Tolérance Toxicité</strong> : Bannissement immédiat en cas d'insultes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span><strong>Respect des Consignes</strong> : Micro requis lorsque l'hôte le stipule.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
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

      {/* Modale Ajouter un Ami */}
      {isAddFriendOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-surface-container border border-surface-container-high rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-white">
                  Ajouter un Ami
                </h3>
              </div>
              <button
                onClick={() => setIsAddFriendOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {friendError && (
              <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{friendError}</span>
              </div>
            )}

            {friendSuccess && (
              <div className="p-3 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{friendSuccess}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddFriend();
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <label
                  htmlFor="add-friend-input"
                  className="block text-xs font-display font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  Pseudo du Joueur
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="add-friend-input"
                    type="text"
                    required
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Ex: SarahChill, AlexVortex..."
                    className="flex-1 bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Suggestions rapides */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[11px] text-on-surface-variant">
                  Joueurs recommandés :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["SarahChill", "AlexVortex", "Valkyrie_FR", "Noxis_FPS"].map((pseudo) => (
                    <button
                      key={pseudo}
                      type="button"
                      onClick={() => handleAddFriend(pseudo)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface border border-surface-container-high/60 text-[11px] font-medium text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      + @{pseudo}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
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

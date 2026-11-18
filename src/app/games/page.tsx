"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Gamepad2,
  ArrowRight,
  Search,
  Star,
  Users,
  Sparkles,
  Trophy,
  Shield,
  Layers,
  Flame,
  Globe,
  Loader2,
} from "lucide-react";
import { ALL_GAMES_CATALOG, CATEGORIES } from "@/lib/games";

export default function GamesCatalogPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous les jeux");
  const [rawgResults, setRawgResults] = useState<any[]>([]);
  const [isSearchingRawg, setIsSearchingRawg] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Charger les vrais salons actifs depuis l'API
  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch("/api/tickets");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTickets(json.data);
        }
      } catch (err) {
        console.warn("Impossible de récupérer les salons en cours:", err);
      } finally {
        setLoadingTickets(false);
      }
    }
    loadTickets();
  }, []);

  // Calcul du nombre réel de salons pour un jeu
  const getGameRoomsCount = (gameName: string, rawgId: number) => {
    return tickets.filter(
      (t) =>
        t.status !== "CLOSED" &&
        (t.gameTitle?.toLowerCase() === gameName.toLowerCase() ||
          t.rawgGameId === rawgId ||
          t.gameSlug === gameName.toLowerCase().replace(/\s+/g, "-"))
    ).length;
  };

  const totalRooms = tickets.filter((t) => t.status !== "CLOSED").length;

  // Filtrage local
  const filteredGames = ALL_GAMES_CATALOG.filter((game) => {
    const matchCat =
      selectedCategory === "Tous les jeux" || game.category === selectedCategory;
    const matchQuery =
      search.trim() === "" ||
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.genre.toLowerCase().includes(search.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchQuery;
  });

  // Recherche complémentaire RAWG si souhaitée
  const handleSearchRawg = async () => {
    if (!search.trim()) return;
    setIsSearchingRawg(true);
    try {
      const res = await fetch(`/api/rawg/games?search=${encodeURIComponent(search.trim())}&pageSize=6`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setRawgResults(data.results);
      }
    } catch (e) {
      console.error("Erreur recherche RAWG:", e);
    } finally {
      setIsSearchingRawg(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" aria-hidden="true" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Bibliothèque Gaming • Base de Salons LFG
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Catalogue des Jeux Vidéo
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                Parcourez tous les jeux disponibles sur LobbyGamer. Cliquez sur un jeu pour explorer directement les salons actifs et trouver vos coéquipiers en 1 clic.
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <div className="px-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Jeux au Catalogue</span>
                <span className="font-mono text-base font-bold text-white">{ALL_GAMES_CATALOG.length} Titres</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-surface-container border border-primary/30 flex flex-col items-center shadow-[0_0_12px_rgba(78,222,163,0.15)]">
                <span className="text-[10px] uppercase font-bold text-primary">Salons Ouverts</span>
                <span className="font-mono text-base font-bold text-primary">
                  {loadingTickets ? "..." : `${totalRooms} ${totalRooms > 1 ? "Salons Actifs" : "Salon Actif"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar & Categories Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un jeu (Overwatch, Valorant, Marvel Rivals, Fortnite...)"
                aria-label="Rechercher un jeu dans le catalogue"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
            </div>

            {/* RAWG Direct Search Button if query entered */}
            {search.trim().length > 2 && (
              <button
                type="button"
                onClick={handleSearchRawg}
                disabled={isSearchingRawg}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-surface-container hover:bg-surface text-primary border border-primary/40 rounded-xl text-xs font-display font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isSearchingRawg ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Recherche RAWG...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Chercher sur RAWG</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                      : "bg-surface-container hover:bg-surface text-on-surface-variant hover:text-white border border-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col items-center justify-center gap-3">
              <Gamepad2 className="w-10 h-10 text-on-surface-variant/40" />
              <h3 className="font-display font-bold text-base text-white">
                Aucun jeu trouvé pour « {search} »
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                Essayez un autre mot-clé ou lancez une recherche directe dans la base de données mondiale RAWG.
              </p>
              <button
                type="button"
                onClick={handleSearchRawg}
                className="mt-2 px-5 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Rechercher sur l'API RAWG
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/?game=${encodeURIComponent(game.name)}`}
                  className="flex flex-col rounded-2xl bg-surface-container-low border border-surface-container-high overflow-hidden hover:border-primary/60 hover:shadow-[0_8px_24px_rgba(78,222,163,0.12)] transition-all group cursor-pointer"
                >
                  {/* Game Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      onError={(e) => {
                        e.currentTarget.src = "/games/default-game.svg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-black/20 to-transparent" />

                    {/* Rating Badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface/85 backdrop-blur-md text-[11px] font-bold text-primary border border-primary/30 flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {game.rating}
                    </span>

                    {/* Team Size Badge */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-surface-container-low/90 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-surface-container-high flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-primary" />
                      {game.teamSize}
                    </span>
                  </div>

                  {/* Game Information */}
                  <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors tracking-tight">
                          {game.name}
                        </h2>
                        {(() => {
                          const roomCount = getGameRoomsCount(game.name, game.id);
                          return (
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 transition-colors ${
                                roomCount > 0
                                  ? "text-primary font-bold bg-primary/10 border-primary/20 shadow-[0_0_8px_rgba(78,222,163,0.15)]"
                                  : "text-on-surface-variant/50 bg-surface-container-high/40 border-surface-container-high"
                              }`}
                            >
                              {roomCount} {roomCount > 1 ? "salons" : "salon"}
                            </span>
                          );
                        })()}
                      </div>

                      <span className="text-[11px] text-tertiary font-medium">
                        {game.genre}
                      </span>

                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    {/* Tags & Action Button */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-surface-container-high/60">
                      <div className="flex flex-wrap gap-1.5">
                        {game.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-surface-container text-[10px] text-on-surface-variant font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="w-full py-2.5 bg-primary/15 group-hover:bg-primary text-primary group-hover:text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all flex items-center justify-center gap-2 shadow-sm">
                        <span>Explorer les Salons</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* RAWG Results (if searched) */}
          {rawgResults.length > 0 && (
            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-surface-container-high">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Résultats trouvés sur RAWG Video Games Database
                  </h3>
                </div>
                <button
                  onClick={() => setRawgResults([])}
                  className="text-xs text-on-surface-variant hover:text-white transition-colors"
                >
                  Effacer les résultats RAWG
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rawgResults.map((r) => (
                  <Link
                    key={r.id}
                    href={`/?game=${encodeURIComponent(r.name)}`}
                    className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high hover:border-primary/50 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <img
                      src={r.coverUrl || "/games/default-game.svg"}
                      alt={r.name}
                      onError={(e) => {
                        e.currentTarget.src = "/games/default-game.svg";
                      }}
                      className="w-16 h-16 rounded-lg object-cover bg-surface-container shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                        {r.name}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Note RAWG : {r.rating || "N/A"} ★
                      </span>
                      <span className="text-[10px] text-primary font-bold mt-1">
                        Rechercher des salons →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


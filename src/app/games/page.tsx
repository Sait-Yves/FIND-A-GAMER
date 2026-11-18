"use client";

import { useState } from "react";
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

export interface CatalogGame {
  id: number;
  name: string;
  slug: string;
  rating: number;
  activeRooms: number;
  category: "FPS & Tactique" | "Hero Shooter" | "Battle Royale" | "Coop & PvE" | "Sport & Arcade";
  genre: string;
  teamSize: string;
  coverUrl: string;
  tags: string[];
  description: string;
}

export const ALL_GAMES_CATALOG: CatalogGame[] = [
  {
    id: 3498,
    name: "Apex Legends",
    slug: "apex-legends",
    rating: 4.8,
    activeRooms: 148,
    category: "Battle Royale",
    genre: "Battle Royale / FPS Compétitif",
    teamSize: "3 Joueurs (Trio)",
    coverUrl: "/games/apex-legends.svg",
    tags: ["Trio", "Classé", "Vocal Requis"],
    description: "Shooter Battle Royale stratégique où des légendes aux compétences uniques s'affrontent aux confins de la Frontière.",
  },
  {
    id: 415171,
    name: "Valorant",
    slug: "valorant",
    rating: 4.9,
    activeRooms: 92,
    category: "FPS & Tactique",
    genre: "Tactical Shooter / FPS 5v5",
    teamSize: "5 Joueurs",
    coverUrl: "/games/valorant.svg",
    tags: ["5v5", "Premier", "Lineups"],
    description: "Jeu de tir tactique en 5v5 avec des agents aux compétences extraordinaires et un gunplay de haute précision.",
  },
  {
    id: 842103,
    name: "Overwatch 2",
    slug: "overwatch-2",
    rating: 4.7,
    activeRooms: 76,
    category: "Hero Shooter",
    genre: "Hero Shooter / Action en Équipe",
    teamSize: "5 Joueurs (1 Tank, 2 DPS, 2 Supports)",
    coverUrl: "https://media.rawg.io/media/games/609/609d94943fcf31c3bf791fc5a4d4f243.jpg",
    tags: ["5v5", "Rôle Lock", "Compétitif"],
    description: "Combattez pour l'avenir dans ce jeu d'action où chaque héros dispose de synergies et capacités ultimes décisives.",
  },
  {
    id: 3328,
    name: "Fortnite",
    slug: "fortnite",
    rating: 4.6,
    activeRooms: 124,
    category: "Battle Royale",
    genre: "Battle Royale / Zero Build",
    teamSize: "4 Joueurs (Section / Squad)",
    coverUrl: "https://media.rawg.io/media/games/d0f/d0f91fe1d923321be5463ab29bead521.jpg",
    tags: ["Zero Build", "Ranked Squad", "Crossplay"],
    description: "Atterrissez sur l'île, survivez à la tempête et soyez la dernière escouade debout en Battle Royale et Zéro Construction.",
  },
  {
    id: 992834,
    name: "Marvel Rivals",
    slug: "marvel-rivals",
    rating: 4.8,
    activeRooms: 85,
    category: "Hero Shooter",
    genre: "Hero Shooter 6v6 Super-Héros",
    teamSize: "6 Joueurs",
    coverUrl: "https://media.rawg.io/media/games/49c/49c34b89ab60fb23f447743f52508924.jpg",
    tags: ["6v6", "Attaques Combinées", "Destruction"],
    description: "Incarnez les super-héros et super-vilains Marvel dans des affrontements effrénés aux environnements destructibles.",
  },
  {
    id: 968798,
    name: "Helldivers 2",
    slug: "helldivers-2",
    rating: 4.7,
    activeRooms: 64,
    category: "Coop & PvE",
    genre: "Shooter Coopératif à la 3e personne",
    teamSize: "4 Joueurs (Escouade)",
    coverUrl: "/games/helldivers-2.svg",
    tags: ["Suicide 9", "Automatons", "Échantillons"],
    description: "Répandez la Démocratie Contrôlée à travers la galaxie avec une escouade de 4 Helldivers face aux hordes extraterrestres.",
  },
  {
    id: 422,
    name: "Warzone 2",
    slug: "warzone-2",
    rating: 4.5,
    activeRooms: 115,
    category: "Battle Royale",
    genre: "Battle Royale & Extraction",
    teamSize: "4 Joueurs (Quads)",
    coverUrl: "/games/warzone-2.svg",
    tags: ["Résurgence", "Al Mazrah", "Rotation"],
    description: "L'arène de combat massive de Call of Duty avec zones de largage intenses, résurgences rapides et contrats tactiques.",
  },
  {
    id: 3272,
    name: "Rocket League",
    slug: "rocket-league",
    rating: 4.8,
    activeRooms: 43,
    category: "Sport & Arcade",
    genre: "Football en Véhicules Turbo",
    teamSize: "3 Joueurs (3v3)",
    coverUrl: "/games/rocket-league.svg",
    tags: ["3v3", "Rotations", "Champion+"],
    description: "Le phénomène mêlant football arcade et bolides propulsés par fusées pour des duels aériens ultra-techniques.",
  },
  {
    id: 416,
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    rating: 4.6,
    activeRooms: 88,
    category: "FPS & Tactique",
    genre: "Tactical FPS Compétitif",
    teamSize: "5 Joueurs",
    coverUrl: "/games/counter-strike-2.svg",
    tags: ["Premier 15k+", "Fumigènes", "Faceit"],
    description: "L'évolution historique du FPS compétitif de Valve avec moteur Source 2, fumigènes volumétriques et mode Premier exigeant.",
  },
  {
    id: 3498,
    name: "Grand Theft Auto V",
    slug: "grand-theft-auto-v",
    rating: 4.9,
    activeRooms: 52,
    category: "Coop & PvE",
    genre: "Open World / Braquages Coop",
    teamSize: "4 Joueurs",
    coverUrl: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
    tags: ["Braquages", "GTA Online", "Organisation"],
    description: "Montez une équipe de choc pour planifier et réussir les braquages les plus lucratifs et spectaculaires de Los Santos.",
  },
  {
    id: 58751,
    name: "Rainbow Six Siege",
    slug: "rainbow-six-siege",
    rating: 4.6,
    activeRooms: 39,
    category: "FPS & Tactique",
    genre: "Tactical CQB 5v5",
    teamSize: "5 Joueurs",
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
    tags: ["5v5 Bomb", "Destruction", "Opérateurs"],
    description: "L'art du siège tactique en combat rapproché, destruction environnementale poussée et synergies d'opérateurs d'élite.",
  },
];

const CATEGORIES = [
  "Tous les jeux",
  "FPS & Tactique",
  "Hero Shooter",
  "Battle Royale",
  "Coop & PvE",
  "Sport & Arcade",
];

export default function GamesCatalogPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous les jeux");
  const [rawgResults, setRawgResults] = useState<any[]>([]);
  const [isSearchingRawg, setIsSearchingRawg] = useState(false);

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

  const totalRooms = ALL_GAMES_CATALOG.reduce((acc, g) => acc + g.activeRooms, 0);

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
                <span className="font-mono text-base font-bold text-primary">{totalRooms} Sessions</span>
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
                        <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                          {game.activeRooms} salons
                        </span>
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

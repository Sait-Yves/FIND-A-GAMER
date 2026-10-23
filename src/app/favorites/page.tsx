"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function FavoritesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const favoriteGames = [
    {
      id: 3498,
      name: "Apex Legends",
      slug: "apex-legends",
      rating: 4.8,
      activeRooms: 148,
      genre: "Battle Royale / Compétitif",
      coverUrl: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
      tags: ["Trio", "Classé", "Vocal Requis"],
    },
    {
      id: 415171,
      name: "Valorant",
      slug: "valorant",
      rating: 4.9,
      activeRooms: 92,
      genre: "Tactical Shooter / FPS",
      coverUrl: "https://media.rawg.io/media/games/7c4/7c448e89f81219b16ea91436cc5fb644.jpg",
      tags: ["5v5", "Premier", "Lineups"],
    },
    {
      id: 968798,
      name: "Helldivers 2",
      slug: "helldivers-2",
      rating: 4.7,
      activeRooms: 64,
      genre: "Coopératif / PvE",
      coverUrl: "https://media.rawg.io/media/games/283/283e7300b0c83d0ab12521d80e604d92.jpg",
      tags: ["Suicide 9", "Automaton", "Échantillons"],
    },
    {
      id: 422,
      name: "Warzone 2",
      slug: "warzone-2",
      rating: 4.5,
      activeRooms: 115,
      genre: "Battle Royale / Extraction",
      coverUrl: "https://media.rawg.io/media/games/121/1213f000d367190048975e530000ec6d.jpg",
      tags: ["Résurgence", "Nocturne", "Quad"],
    },
    {
      id: 3272,
      name: "Rocket League",
      slug: "rocket-league",
      rating: 4.8,
      activeRooms: 43,
      genre: "Sport / Arcade",
      coverUrl: "https://media.rawg.io/media/games/8cc/8cce7c0e99dcc23d30960948bc15107f.jpg",
      tags: ["3v3", "Champion+", "Rotation"],
    },
    {
      id: 416,
      name: "Counter-Strike 2",
      slug: "counter-strike-2",
      rating: 4.6,
      activeRooms: 88,
      genre: "Tactical FPS",
      coverUrl: "https://media.rawg.io/media/games/736/736190961c8777183508137b500d09de.jpg",
      tags: ["Premier 15k+", "Mirage", "Faceit"],
    },
  ];

  const filtered = favoriteGames.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-16 lg:pl-72 w-full min-h-screen p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  sports_esports
                </span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Bibliothèque Gaming RAWG
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Mes Jeux Vidéo Favoris
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Accédez rapidement aux salons de vos jeux préférés et lancez des sessions de matchmaking en 1 clic.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer un jeu..."
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((game) => (
              <div
                key={game.id}
                className="flex flex-col rounded-2xl bg-surface-container-low border border-surface-container-high overflow-hidden hover:border-primary/50 transition-all shadow-md group"
              >
                <div className="relative h-44 w-full overflow-hidden bg-surface-container">
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-surface/80 backdrop-blur-md text-[10px] font-bold text-primary border border-primary/30">
                    ★ {game.rating}
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-white">
                      {game.name}
                    </h3>
                    <span className="text-xs font-mono text-primary font-bold">
                      {game.activeRooms} salons
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant">{game.genre}</p>

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

                  <Link
                    href={`/?game=${encodeURIComponent(game.name)}`}
                    className="mt-2 w-full py-2 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Explorer les Salons</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

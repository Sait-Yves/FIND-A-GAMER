"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<"games" | "reviews">("games");

  // Données de profil fictives basées sur le schéma Prisma et le seed
  const user = {
    username: "AlexVortex",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300",
    bio: "Joueur compétitif sur Valorant et CS2. Toujours fair-play, focus endgame et communication claire. N'hésitez pas à me ping pour des ranked !",
    age: 24,
    primaryPlatform: "PC",
    playerType: "COMPETITIVE",
    reputationScore: 96.5,
    totalReviews: 12,
    lastActive: "Il y a 3 minutes",
    favoriteGames: [
      {
        id: 415171,
        title: "Valorant",
        slug: "valorant",
        coverUrl: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
        hours: "340h de jeu",
      },
      {
        id: 4200,
        title: "Portal 2",
        slug: "portal-2",
        coverUrl: "https://media.rawg.io/media/games/328/3283613cb7d75d67257fc58339188742.jpg",
        hours: "85h de jeu",
      },
      {
        id: 3498,
        title: "Grand Theft Auto V",
        slug: "grand-theft-auto-v",
        coverUrl: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
        hours: "210h de jeu",
      },
    ],
    reviews: [
      {
        id: "1",
        author: "SarahChill",
        rating: 5,
        date: "Hier",
        comment: "Super lead d'équipe, très calme et d'excellents callouts en situation de clutch !",
        tags: ["FAIR_PLAY", "GOOD_COMMUNICATION", "LEADER"],
      },
      {
        id: "2",
        author: "DemocratieFirst",
        rating: 5,
        date: "Il y a 3 jours",
        comment: "Ponctuel, micro parfait et teamplayer. Je recommande !",
        tags: ["TEAM_PLAYER", "PUNCTUAL"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <Sidebar />

      <main className="ml-72 mt-16 p-6 flex flex-col gap-6 max-w-5xl">
        {/* Profile Card Header */}
        <div className="relative p-6 bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-lg">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/50 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-surface animate-pulse" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-display font-bold text-white tracking-wide">
                    @{user.username}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
                    Vérifié Fair-Play
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1 text-white">
                    <span className="material-symbols-outlined text-sm text-primary">devices</span>
                    {user.primaryPlatform}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-tertiary font-medium">
                    <span className="material-symbols-outlined text-sm">sports_esports</span>
                    {user.playerType}
                  </span>
                  <span>•</span>
                  <span>{user.age} ans</span>
                  <span>•</span>
                  <span className="text-primary font-medium">Actif : {user.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Edit / Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/profile/edit"
                className="flex-1 sm:flex-none text-center px-4 py-2 bg-surface-container hover:bg-surface-container-high text-white text-xs font-display font-bold rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Modifier le Profil
              </Link>
            </div>
          </div>

          {/* Bio text */}
          <p className="mt-5 text-xs text-on-surface leading-relaxed max-w-3xl">
            {user.bio}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-surface-container-high/60">
            <div className="p-3 bg-surface-container rounded-xl flex flex-col">
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">
                Score Karma / Réputation
              </span>
              <span className="text-lg font-display font-bold text-primary mt-1">
                {user.reputationScore}% ★
              </span>
            </div>

            <div className="p-3 bg-surface-container rounded-xl flex flex-col">
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">
                Avis Reçus
              </span>
              <span className="text-lg font-display font-bold text-white mt-1">
                {user.totalReviews} évaluations
              </span>
            </div>

            <div className="p-3 bg-surface-container rounded-xl flex flex-col">
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">
                Taux de Complétion
              </span>
              <span className="text-lg font-display font-bold text-secondary mt-1">
                98% sans abandon
              </span>
            </div>

            <div className="p-3 bg-surface-container rounded-xl flex flex-col">
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">
                Salons Hébergés
              </span>
              <span className="text-lg font-display font-bold text-tertiary mt-1">
                24 tickets créés
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Jeux Favoris & Évaluations) */}
        <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
          <button
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              activeTab === "games"
                ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Jeux Favoris (RAWG)
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              activeTab === "reviews"
                ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Évaluations & Badges de Comportement ({user.reviews.length})
          </button>
        </div>

        {/* Tab 1: Favorite Games Grid */}
        {activeTab === "games" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {user.favoriteGames.map((game) => (
              <div
                key={game.id}
                className="group relative rounded-2xl overflow-hidden bg-surface-container-low border border-surface-container-high hover:border-primary/50 transition-all shadow-md"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">{game.hours}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Reputation Reviews List */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-3">
            {user.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-white">
                      @{rev.author}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">• {rev.date}</span>
                  </div>
                  <div className="flex items-center text-primary text-xs">
                    {"★".repeat(rev.rating)}
                  </div>
                </div>

                <p className="text-xs text-on-surface leading-relaxed">{rev.comment}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {rev.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-display font-bold bg-primary/10 text-primary border border-primary/20"
                    >
                      {t.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

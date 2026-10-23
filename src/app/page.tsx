"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

export default function ExplorerPage() {
  const [selectedGame, setSelectedGame] = useState("Apex Legends");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChip, setActiveChip] = useState("fairplay");

  const games = [
    { name: "Apex Legends", activeRooms: 118, icon: "sports_esports" },
    { name: "Valorant", activeRooms: 32, icon: "shield" },
    { name: "Helldivers 2", activeRooms: 64, icon: "military_tech" },
    { name: "Warzone 2", activeRooms: 112, icon: "crosshairs" },
    { name: "Rocket League", activeRooms: 43, icon: "sports_soccer" },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-72 mt-16 p-6 flex gap-6">
        {/* Left Column: Feeds & Filters (approx 72% width) */}
        <div className="flex-1 flex flex-col gap-5 max-w-5xl">
          {/* Top Live Stats Banner */}
          <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-display font-bold text-white tracking-wider uppercase text-[11px]">
                Radar de Recherche
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface">
                <strong className="text-white">2 342</strong> Joueurs actifs
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface">
                <strong className="text-white">189</strong> Salons disponibles
              </span>
              <span className="text-on-surface-variant">•</span>
              <span className="text-on-surface">
                <strong className="text-primary font-mono">~42s</strong> Matchmaking médian
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                Flux Temps-Réel Actif
              </span>
            </div>
          </div>

          {/* Game Selection Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {games.map((game) => {
              const isSelected = selectedGame === game.name;
              return (
                <button
                  key={game.name}
                  onClick={() => setSelectedGame(game.name)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-display font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-surface-container-high text-white border-2 border-primary shadow-[0_0_14px_rgba(78,222,163,0.2)]"
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
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
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

          {/* Filter Dropdowns & Chips Bar */}
          <div className="flex flex-col gap-3 p-4 bg-surface-container-low rounded-xl border border-surface-container-high">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Mode de Jeu
                </span>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Tous les modes (Ranked & Noct)</option>
                  <option>Ranked Compétitif</option>
                  <option>Partie Rapide / Chill</option>
                  <option>Tournoi / Scrims</option>
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Plateforme
                </span>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Crossplay (Toutes plateformes)</option>
                  <option>PC Uniquement</option>
                  <option>PlayStation 5</option>
                  <option>Xbox Series X|S</option>
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Langue & Région
                </span>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Français & Anglais (Europe)</option>
                  <option>Français Uniquement</option>
                  <option>Anglais (EU West)</option>
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-display font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1">
                  Niveau / Rang
                </span>
                <select className="w-full bg-surface-container border border-surface-container-high rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary">
                  <option>Tous niveaux acceptés</option>
                  <option>Diamant II+ Minimum</option>
                  <option>Platine / Master</option>
                  <option>Débutant bienvenu</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60">
              <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">mic</span>
                  <span>+ Micro requis</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">explicit</span>
                  <span>+ 18+ Seulement</span>
                </button>

                <button
                  onClick={() => setActiveChip(activeChip === "fairplay" ? "" : "fairplay")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                    activeChip === "fairplay"
                      ? "bg-tertiary/15 text-tertiary border border-tertiary/40 shadow-[0_0_8px_rgba(76,215,246,0.2)]"
                      : "bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Fair-play 4.5+ ★</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant hover:text-white transition-colors">
                  <span>Chill / Détente</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant hover:text-white transition-colors">
                  <span>Tryhard / Séries</span>
                </button>
              </div>

              {/* Sorter */}
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span>Trier par:</span>
                <span className="text-white font-medium cursor-pointer underline decoration-primary underline-offset-4">
                  Récents
                </span>
                <span>•</span>
                <span className="hover:text-white cursor-pointer">Remplissage rapide</span>
                <span>•</span>
                <span className="hover:text-white cursor-pointer">Meilleur Ping</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TICKET CARD 1: APEX LEGENDS (TRIO RANKED) */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-3.5 p-5 bg-surface-container-low rounded-2xl border border-surface-container-high hover:border-primary/50 transition-all shadow-md group">
            {/* Header: Host & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100"
                    alt="Host"
                    className="w-10 h-10 rounded-xl object-cover border border-primary/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">
                      @Noxis_FPS
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
                      Hôte Squad
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      4.9/5 Fair-Play Garanti
                    </span>
                    <span>•</span>
                    <span>98% matches finis</span>
                    <span>•</span>
                    <span>EU Frankfurt (18ms)</span>
                    <span>•</span>
                    <span className="text-secondary font-medium">Crossplay ON</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-display font-bold text-white uppercase tracking-wider">
                  Salon Ouvert
                </span>
              </div>
            </div>

            {/* Ticket Title & Description */}
            <div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-primary transition-colors">
                <span className="text-primary">[Apex Legends]</span> TRIO RANKED — GRIND MASTER / DIAMANT II+
              </h3>
              <p className="text-xs text-on-surface-variant/90 mt-1.5 leading-relaxed">
                Cherche 1 joueur sérieux avec bon call et focus endgame. Pas de toxicité, rotation propre en zone. On joue Valkyrie / Bangalore combo. Objectif points RP constants.
              </p>
            </div>

            {/* Rule Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">mic</span>
                MICRO OBLIGATOIRE
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">explicit</span>
                +18 ANS REQUIS
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">military_tech</span>
                DIAMANT II+ MINIMUM
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                OBJECTIF TOP 1
              </span>
            </div>

            {/* Squad Slots Visualization */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* Slot 1: Noxis (Host) */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container border border-surface-container-high">
                <img
                  src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100"
                  alt="Noxis"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">Noxis_FPS</span>
                  <span className="text-[10px] text-on-surface-variant truncate">Bangalore • Lv.412</span>
                </div>
              </div>

              {/* Slot 2: You (Valkyrie) */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container border border-surface-container-high">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Valkyrie"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">Valkyrie_FR (Vous)</span>
                  <span className="text-[10px] text-primary truncate">Valkyrie • Lv.378</span>
                </div>
              </div>

              {/* Slot 3: Empty Slot */}
              <div className="flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary">
                <span className="material-symbols-outlined text-base animate-pulse">
                  person_add
                </span>
                <span className="text-xs font-display font-bold uppercase tracking-wider">
                  Slot 3 Libre
                </span>
              </div>
            </div>

            {/* Card Footer: Players count, Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-surface-container-high/60">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="font-display font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  2 / 3 Joueurs prêts
                </span>
                <span>•</span>
                <span>Début il y a 4 min</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  title="Enregistrer"
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
                <button
                  title="Partager le ticket"
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
                <Link
                  href="/tickets/apex-legends-ranked-demo"
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(78,222,163,0.25)] transition-all"
                >
                  <span>Rejoindre le Lobby</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TICKET CARD 2: VALORANT PREMIER */}
          {/* ========================================================================= */}
          <div className="flex flex-col gap-3.5 p-5 bg-surface-container-low rounded-2xl border border-surface-container-high hover:border-tertiary/50 transition-all shadow-md group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tertiary/30 to-secondary/30 border border-tertiary/50 flex items-center justify-center font-display font-bold text-white text-sm">
                  EX
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">
                      @Excalibur
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary/15 text-tertiary border border-tertiary/30 uppercase">
                      Hôte Premier
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                    <span className="text-tertiary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      5.0/5 Fair-Play Étoile
                    </span>
                    <span>•</span>
                    <span>Paris FR (14ms)</span>
                    <span>•</span>
                    <span className="text-white">PC Only</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                <span className="text-[11px] font-display font-bold text-tertiary uppercase tracking-wider">
                  1 Place Restante
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-tertiary transition-colors">
                <span className="text-tertiary">[Valorant]</span> PREMIER TOURNAMENT SUB-6 SCRIMS CE SOIR
              </h3>
              <p className="text-xs text-on-surface-variant/90 mt-1.5 leading-relaxed">
                Besoin d'un initiateur ou contrôleur expérimenté pour notre match officiel Premier Division Élite prévu à 21h00. Bonne humeur exigée, intro fluide Discord, exécutions propres sur Ascent et Haven.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-secondary flex items-center gap-1">
                VOCAL DISCORD
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-tertiary flex items-center gap-1">
                IMMORTAL 1+ REQUIS
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-white flex items-center gap-1">
                STRATÉGIES FIXES
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container border border-surface-container-high text-primary flex items-center gap-1">
                NON-TOXIQUE
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-container-high/60">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="font-display font-semibold text-tertiary">
                  4 / 5 Dernière place dispo
                </span>
                <span>•</span>
                <span>Tournoi dans 40 min</span>
              </div>

              <Link
                href="/tickets/valorant-premier-demo"
                className="flex items-center gap-2 px-4 py-2 bg-tertiary hover:bg-tertiary-fixed text-surface font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(76,215,246,0.25)] transition-all"
              >
                <span>Rejoindre le Lobby</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Right Column: Widgets (approx 28% width) */}
        {/* ========================================================================= */}
        <aside className="w-80 flex flex-col gap-5 shrink-0">
          {/* Widget 1: Mon Statut d'Équipe */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                Mon Statut d'Équipe
              </span>
              <span className="text-[10px] font-semibold text-primary">Solo</span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high/80 text-center flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <span className="text-xs font-semibold text-white">
                Aucun salon rejoint
              </span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Parcourez le flux de tickets à gauche ou créez votre propre escouade pour recruter des coéquipiers.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-2 py-2 px-3 bg-surface hover:bg-surface-container-high text-white font-display font-semibold text-xs rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-primary">add</span>
                Créer un Nouveau Salon
              </button>
            </div>
          </div>

          {/* Widget 2: Préférences de profil */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-2">
            <span className="text-xs font-display font-bold text-white">
              Besoin d'un profil précis ?
            </span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Filtrez vos coéquipiers par infos (micro, niveau minimum, jeux favoris et style de joueur).
            </p>
            <Link
              href="/profile/edit"
              className="mt-2 py-2 text-center bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-display font-bold tracking-wider transition-colors"
            >
              Éditer mes Préférences
            </Link>
          </div>

          {/* Widget 3: Amis en Ligne */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                Amis en Ligne & Salons
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
                <button className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface text-[10px] font-display font-bold text-white border border-surface-container-high">
                  Rejoindre
                </button>
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
                <button className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface text-[10px] font-display font-bold text-white border border-surface-container-high">
                  Inviter
                </button>
              </div>
            </div>
          </div>

          {/* Widget 4: Charte Fair-Play */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-3">
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
                <span><strong>Zéro Tolérance Toxicité</strong> : Bannissement instantané en cas d'insultes en vocal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Respect des Consignes</strong> : Micro requis lorsque l'hôte le demande.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span><strong>Évaluation Post-Match</strong> : Notez vos coéquipiers pour faire monter leur réputation.</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

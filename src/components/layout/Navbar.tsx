"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.4)] flex items-center justify-between px-6">
      {/* Brand & Live status */}
      <div className="flex items-center gap-6 w-72">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-display font-bold text-on-primary text-base shadow-[0_0_12px_rgba(78,222,163,0.3)] group-hover:scale-105 transition-transform">
            LG
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white">
            LOBBY<span className="text-primary">GAMER</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            LIVE
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-6">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/70 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un jeu, un salon, un joueur... [Ctrl+K]"
            className="w-full bg-surface-container-low hover:bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-10 pr-16 py-2 border border-surface-container-high focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all font-sans"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant/70 bg-surface-container border border-surface-container-high rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.25)] hover:shadow-[0_0_20px_rgba(78,222,163,0.4)] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Créer un Ticket
        </button>

        {/* Mic Control */}
        <button
          title="Microphone activé"
          className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-center text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">mic</span>
        </button>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-surface-container-high">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover border border-primary/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-semibold text-xs text-white">
              @Valkyrie_FR
            </span>
            <span className="text-[10px] font-medium text-primary">En Ligne</span>
          </div>
        </div>
      </div>
    </header>
  );
}

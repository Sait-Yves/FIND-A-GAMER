"use client";

import Link from "next/link";

interface NavbarProps {
  onOpenCreateModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onToggleSidebar?: () => void;
}

export function Navbar({
  onOpenCreateModal,
  searchQuery = "",
  onSearchChange,
  onToggleSidebar,
}: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.4)] flex items-center justify-between px-3 sm:px-6">
      {/* Brand & Mobile menu button */}
      <div className="flex items-center gap-3 sm:gap-4 lg:w-72">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-display font-bold text-on-primary text-base shadow-[0_0_12px_rgba(78,222,163,0.3)] group-hover:scale-105 transition-transform">
            LG
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white hidden sm:inline">
            LOBBY<span className="text-primary">GAMER</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-low border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
            LIVE
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-4">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/70 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher jeu, salon, joueur... [Ctrl+K]"
            className="w-full bg-surface-container-low hover:bg-surface-container text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-9 sm:pl-10 pr-12 sm:pr-14 py-2 border border-surface-container-high focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all font-sans"
          />
          <kbd className="hidden sm:inline absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant/70 bg-surface-container border border-surface-container-high rounded pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.25)] hover:shadow-[0_0_20px_rgba(78,222,163,0.4)] active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span className="hidden md:inline">Créer un Ticket</span>
        </button>

        {/* Mic Control */}
        <button
          title="Microphone activé"
          className="hidden sm:flex w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high items-center justify-center text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">mic</span>
        </button>

        {/* Notification Bell */}
        <Link
          href="/messages"
          title="Messages et alertes"
          className="relative w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
        </Link>

        {/* User Profile Pill */}
        <Link
          href="/profile/edit"
          className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-surface-container-high hover:opacity-90 transition-opacity"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              alt="Avatar"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-primary/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-display font-semibold text-xs text-white">
              @Valkyrie_FR
            </span>
            <span className="text-[10px] font-medium text-primary">En Ligne</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

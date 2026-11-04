"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  Mic,
  Bell,
  Menu,
  LogOut,
  Settings,
  User,
  ChevronDown,
  LogIn,
  Users,
  Gamepad2,
  Loader2,
  X,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

interface SearchUserResult {
  id: string;
  username: string;
  avatarUrl?: string | null;
  playerType?: string;
  primaryPlatform?: string;
  reputationScore?: number;
}

interface SearchTicketResult {
  id: string;
  title: string;
  gameTitle: string;
  gameCoverUrl?: string | null;
  currentPlayers: number;
  maxPlayers: number;
  host?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
}

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
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [internalCreateModalOpen, setInternalCreateModalOpen] = useState(false);

  // Recherche globale (salons & joueurs)
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: SearchUserResult[];
    tickets: SearchTicketResult[];
  }>({ users: [], tickets: [] });

  // Synchronisation si le parent change searchQuery
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleCreateTicketClick = () => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setInternalCreateModalOpen(true);
    }
  };

  // Charger la session utilisateur
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Erreur auth session:", err);
      }
    }
    checkAuth();
  }, []);

  // Fermer les menus lors d'un clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Raccourci global Ctrl+K / Cmd+K pour activer la barre de recherche
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Recherche live avec debounce
  useEffect(() => {
    const trimmed = localQuery.trim();
    if (!trimmed) {
      setSearchResults({ users: [], tickets: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults({
            users: data.users || [],
            tickets: data.tickets || [],
          });
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error("Erreur recherche live:", err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [localQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
    if (val.trim()) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsDropdownOpen(false);
      if (localQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(localQuery.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
    setSearchResults({ users: [], tickets: [] });
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setIsMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Erreur déconnexion:", e);
    }
  };

  const hasResults =
    searchResults.users.length > 0 || searchResults.tickets.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.4)] flex items-center justify-between px-3 sm:px-6">
      {/* Brand & Mobile menu button */}
      <div className="flex items-center gap-3 sm:gap-4 lg:w-72">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
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

      {/* Center Search Bar with Autocomplete Dropdown */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-4 relative" ref={searchContainerRef}>
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3 text-on-surface-variant/70 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (localQuery.trim()) setIsDropdownOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Rechercher un salon, un joueur... [Ctrl+K]"
            className="w-full bg-surface-container-low hover:bg-surface-container text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 rounded-xl pl-9 sm:pl-10 pr-16 sm:pr-20 py-2 border border-surface-container-high focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all font-sans"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : localQuery ? (
              <button
                onClick={handleClearSearch}
                className="p-1 text-on-surface-variant hover:text-white rounded-md transition-colors"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant/70 bg-surface-container border border-surface-container-high rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {isDropdownOpen && localQuery.trim().length > 0 && (
          <div className="absolute top-full mt-2.5 left-0 right-0 bg-[#121620] border border-[#2b3140] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-3 z-[100] max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
            {isSearching && !hasResults ? (
              <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-2 text-xs text-on-surface-variant">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span>Recherche de salons et joueurs...</span>
              </div>
            ) : !hasResults ? (
              <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-1 text-xs text-on-surface-variant">
                <span className="text-white font-medium">Aucun résultat trouvé</span>
                <span>Aucun salon ou joueur ne correspond à « {localQuery} »</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Section Joueurs */}
                {searchResults.users.length > 0 && (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between px-2.5 py-1 mb-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Joueurs ({searchResults.users.length})</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {searchResults.users.map((u) => (
                        <Link
                          key={u.id}
                          href={`/profile/${encodeURIComponent(u.username)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#181c28] hover:bg-[#202636] border border-surface-container-high/60 hover:border-primary/40 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl || "/avatars/avatar-default.svg"}
                              alt={u.username}
                              onError={(e) => {
                                e.currentTarget.src = "/avatars/avatar-default.svg";
                              }}
                              className="w-8 h-8 rounded-lg object-cover border border-primary/40 bg-surface shrink-0"
                            />
                            <div className="flex flex-col text-left">
                              <span className="font-display font-semibold text-xs text-white group-hover:text-primary transition-colors">
                                @{u.username}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
                                <span>{u.primaryPlatform || "PC"}</span>
                                <span>•</span>
                                <span className="text-tertiary">{u.playerType || "CHILL"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {u.reputationScore !== undefined && (
                              <span className="text-[11px] font-display font-bold text-primary flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                <ShieldCheck className="w-3 h-3" />
                                {u.reputationScore}%
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section Salons / Tickets */}
                {searchResults.tickets.length > 0 && (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between px-2.5 py-1 mb-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-tertiary bg-tertiary/10 rounded-lg border border-tertiary/20">
                      <div className="flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Salons ouverts ({searchResults.tickets.length})</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {searchResults.tickets.map((t) => (
                        <Link
                          key={t.id}
                          href={`/tickets/${t.id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#181c28] hover:bg-[#202636] border border-surface-container-high/60 hover:border-tertiary/40 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-surface border border-surface-container-high overflow-hidden shrink-0 flex items-center justify-center">
                              <img
                                src={t.gameCoverUrl || "/games/default-game.svg"}
                                alt={t.gameTitle}
                                onError={(e) => {
                                  e.currentTarget.src = "/games/default-game.svg";
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="font-display font-semibold text-xs text-white truncate group-hover:text-tertiary transition-colors">
                                {t.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant truncate">
                                <span className="text-white/80">{t.gameTitle}</span>
                                {t.host && (
                                  <>
                                    <span>•</span>
                                    <span>Hôte: @{t.host.username}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[#121620] border border-surface-container-high text-white">
                              {t.currentPlayers}/{t.maxPlayers}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-tertiary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pied de liste : action directe */}
            <div className="pt-2.5 mt-2.5 border-t border-surface-container-high">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push(`/?search=${encodeURIComponent(localQuery.trim())}`);
                }}
                className="w-full py-2 px-3 text-xs font-display font-medium text-center rounded-xl bg-[#181c28] hover:bg-surface-container-high text-white transition-colors flex items-center justify-between cursor-pointer border border-surface-container-high/60"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Search className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">Voir tous les salons pour « <strong className="text-primary font-semibold">{localQuery}</strong> »</span>
                </span>
                <span className="text-[10px] text-primary font-mono bg-[#121620] px-1.5 py-0.5 rounded border border-surface-container-high shrink-0 ml-2">
                  Entrée ↵
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleCreateTicketClick}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.25)] hover:shadow-[0_0_20px_rgba(78,222,163,0.4)] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden md:inline">Créer un Ticket</span>
        </button>

        {/* Mic Control */}
        <button
          onClick={() => setIsMicActive(!isMicActive)}
          title={isMicActive ? "Microphone actif" : "Microphone muet"}
          className={`hidden sm:flex w-9 h-9 rounded-xl border items-center justify-center transition-colors cursor-pointer ${
            isMicActive
              ? "bg-surface-container-low text-primary border-surface-container-high"
              : "bg-error/20 text-error border-error/40"
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <Link
          href="/messages"
          title="Messagerie & Alertes"
          className="relative w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
        </Link>

        {/* User Profile Pill or Login Link */}
        {currentUser ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-surface-container-high hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="relative">
                <img
                  src={
                    currentUser.avatarUrl ||
                    "/avatars/avatar-default.svg"
                  }
                  alt={currentUser.username}
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/avatar-default.svg";
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-primary/50 bg-surface-container"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="font-display font-semibold text-xs text-white">
                  @{currentUser.username}
                </span>
                <span className="text-[10px] font-medium text-primary">En Ligne</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-surface-container border border-surface-container-high rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in duration-150">
                <div className="p-2.5 border-b border-surface-container-high flex flex-col">
                  <span className="font-display font-bold text-xs text-white">
                    @{currentUser.username}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate">
                    {currentUser.email}
                  </span>
                </div>

                <Link
                  href="/profile/edit"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium text-on-surface hover:text-white hover:bg-surface-container-high transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>Mon Profil Joueur</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-medium text-on-surface hover:text-white hover:bg-surface-container-high transition-colors"
                >
                  <Settings className="w-4 h-4 text-tertiary" />
                  <span>Paramètres du Compte</span>
                </Link>

                <div className="border-t border-surface-container-high my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-display font-semibold text-error hover:bg-error/15 transition-colors w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface text-white border border-surface-container-high rounded-xl text-xs font-display font-bold transition-all"
          >
            <LogIn className="w-4 h-4 text-primary" />
            <span>Connexion</span>
          </Link>
        )}
      </div>

      <CreateTicketModal
        isOpen={internalCreateModalOpen}
        onClose={() => setInternalCreateModalOpen(false)}
        onCreated={(newTicket) => {
          setInternalCreateModalOpen(false);
          router.push(`/tickets/${newTicket.id}`);
          router.refresh();
        }}
      />
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Users,
  UserPlus,
  UserMinus,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Gamepad2,
  Monitor,
  Radio,
  X,
  Loader2,
} from "lucide-react";

interface Friend {
  id: string;
  username: string;
  avatarUrl?: string;
  primaryPlatform?: string;
  playerType?: string;
  currentGame?: string;
  isOnline?: boolean;
  reputationScore?: number;
}

export default function FriendsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "online" | "gaming">("all");

  // Modale d'ajout d'ami
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Modale de confirmation de suppression
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Charger la liste des amis depuis l'API
  const loadFriends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends");
      const json = await res.json();
      if (json.success && Array.isArray(json.friends)) {
        setFriends(json.friends);
      }
    } catch (e) {
      console.error("Erreur chargement amis:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // Ajouter un ami
  const handleAddFriend = async (e?: React.FormEvent, usernameToAdd?: string) => {
    if (e) e.preventDefault();
    const target = (usernameToAdd || newFriendUsername).trim();
    if (!target) return;

    setIsAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: target }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || `@${target} a été ajouté à vos amis !`);
        setNewFriendUsername("");
        setIsAddModalOpen(false);
        loadFriends();
      } else {
        setAddError(json.error || "Impossible d'ajouter ce joueur");
      }
    } catch {
      setAddError("Une erreur est survenue lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  };

  // Supprimer un ami
  const handleConfirmRemove = async () => {
    if (!friendToRemove) return;
    setIsRemoving(true);

    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: friendToRemove.username }),
      });
      const json = await res.json();

      if (json.success) {
        setFriends((prev) => prev.filter((f) => f.username !== friendToRemove.username));
        showToast(`@${friendToRemove.username} a été retiré de votre liste d'amis.`);
      } else {
        showToast(json.error || "Erreur lors du retrait de l'ami");
      }
    } catch {
      showToast("Erreur réseau");
    } finally {
      setIsRemoving(false);
      setFriendToRemove(null);
    }
  };

  // Filtrage des amis
  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.currentGame && friend.currentGame.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterMode === "online") return friend.isOnline;
    if (filterMode === "gaming") return friend.currentGame && friend.currentGame !== "En ligne";
    return true;
  });

  const onlineCount = friends.filter((f) => f.isOnline).length;
  const inGameCount = friends.filter((f) => f.currentGame && f.currentGame !== "En ligne").length;

  const SUGGESTED_PLAYERS = [
    { username: "SarahChill", platform: "PLAYSTATION", activity: "Apex Legends" },
    { username: "AlexVortex", platform: "PC", activity: "CS2" },
    { username: "Valkyrie_FR", platform: "PC", activity: "Valorant" },
    { username: "Noxis_FPS", platform: "PC", activity: "Helldivers 2" },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header Banner */}
          <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Gestion des Amis & Coéquipiers
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Mes Amis ({friends.length})
              </h1>
              <p className="text-xs text-on-surface-variant">
                Gérez votre réseau de coéquipiers fiables, lancez des sessions vocales et discutez en privé.
              </p>
            </div>

            <button
              onClick={() => {
                setAddError(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(78,222,163,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un Ami</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Total d'Amis
                </span>
                <p className="text-xl font-display font-bold text-white mt-0.5">{friends.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  En Ligne
                </span>
                <p className="text-xl font-display font-bold text-primary mt-0.5">{onlineCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Radio className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  En Partie
                </span>
                <p className="text-xl font-display font-bold text-tertiary mt-0.5">{inGameCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Gamepad2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par pseudo ou par jeu..."
                aria-label="Filtrer mes amis"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-colors cursor-pointer ${
                  filterMode === "all"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white"
                }`}
              >
                Tous ({friends.length})
              </button>
              <button
                onClick={() => setFilterMode("online")}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-colors cursor-pointer ${
                  filterMode === "online"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white"
                }`}
              >
                En Ligne ({onlineCount})
              </button>
              <button
                onClick={() => setFilterMode("gaming")}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-colors cursor-pointer ${
                  filterMode === "gaming"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white"
                }`}
              >
                En Jeu ({inGameCount})
              </button>
            </div>
          </div>

          {/* Friends Grid */}
          {loading ? (
            <div className="p-16 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-on-surface-variant">Chargement de votre liste d'amis...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-16 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col items-center justify-center text-center gap-4">
              <Users className="w-12 h-12 text-on-surface-variant/40" />
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {searchQuery ? "Aucun ami trouvé" : "Aucun ami enregistré pour le moment"}
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                  {searchQuery
                    ? `Aucun ami ne correspond à « ${searchQuery} ».`
                    : "Ajoutez vos premiers coéquipiers pour lancer des sessions de jeu plus facilement !"}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                + Ajouter un Ami
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id || friend.username}
                  className="p-4 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-surface-container-high hover:border-primary/40 transition-all flex flex-col justify-between gap-4 shadow-sm group"
                >
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={friend.avatarUrl || "/avatars/avatar-default.svg"}
                          alt={friend.username}
                          onError={(e) => {
                            e.currentTarget.src = "/avatars/avatar-default.svg";
                          }}
                          className="w-12 h-12 rounded-xl object-cover bg-surface border border-surface-container-high"
                        />
                        {friend.isOnline && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface animate-pulse"
                            title="En ligne"
                          />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/profile/${encodeURIComponent(friend.username)}`}
                          className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors truncate"
                        >
                          @{friend.username}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-secondary" />
                            {friend.primaryPlatform || "PC"}
                          </span>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {friend.reputationScore ? `${friend.reputationScore}% ★` : "Fair-play"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick remove button */}
                    <button
                      onClick={() => setFriendToRemove(friend)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/15 transition-all opacity-60 group-hover:opacity-100 cursor-pointer"
                      title={`Retirer @${friend.username} de mes amis`}
                      aria-label={`Retirer @${friend.username} de mes amis`}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Activity Bar */}
                  <div className="p-2.5 rounded-xl bg-surface-container/60 border border-surface-container-high/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Gamepad2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                      <span className="text-on-surface-variant text-[11px] truncate">
                        {friend.currentGame || (friend.isOnline ? "Disponible pour jouer" : "Hors ligne")}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        friend.isOnline
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {friend.isOnline ? "En Ligne" : "Hors Ligne"}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-container-high/40">
                    <Link
                      href={`/messages?user=${encodeURIComponent(friend.username)}`}
                      className="py-2 px-3 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(78,222,163,0.2)] text-center cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Discuter</span>
                    </Link>

                    <Link
                      href={`/profile/${encodeURIComponent(friend.username)}`}
                      className="py-2 px-3 bg-surface-container hover:bg-surface-container-high text-white font-display font-bold text-xs rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-primary" />
                      <span>Profil</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions Section */}
          <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tertiary" />
                <h3 className="font-display font-bold text-sm text-white">
                  Joueurs recommandés pour votre escouade
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant">Fair-play certifié 4.8+ ★</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUGGESTED_PLAYERS.filter(
                (p) => !friends.some((f) => f.username.toLowerCase() === p.username.toLowerCase())
              ).map((sugg) => (
                <div
                  key={sugg.username}
                  className="p-3 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <Link
                      href={`/profile/${sugg.username}`}
                      className="font-bold text-xs text-white hover:text-primary transition-colors truncate"
                    >
                      @{sugg.username}
                    </Link>
                    <span className="text-[10px] text-on-surface-variant truncate">
                      {sugg.platform} • {sugg.activity}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddFriend(undefined, sugg.username)}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all cursor-pointer shrink-0"
                    title={`Ajouter @${sugg.username}`}
                    aria-label={`Ajouter @${sugg.username}`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* Modale d'ajout d'ami                                                      */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
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
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Pseudo du joueur
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Ex: SarahChill, Hiroshi_89..."
                    required
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl pl-7 pr-3 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {addError && (
                <div className="p-3 bg-error/15 border border-error/30 rounded-xl flex items-center gap-2 text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-display font-bold text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newFriendUsername.trim()}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAdding ? "Ajout..." : "Confirmer l'ajout"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modale de Confirmation de Retrait d'Ami                                   */}
      {/* ========================================================================= */}
      {friendToRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-surface-container border border-surface-container-high rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center text-error">
                <UserMinus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Retirer de vos amis ?
                </h3>
                <span className="text-xs text-on-surface-variant">
                  @{friendToRemove.username}
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Êtes-vous certain de vouloir retirer <strong>@{friendToRemove.username}</strong> de votre liste d'amis ? Vous pourrez toujours le rajouter ultérieurement.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFriendToRemove(null)}
                className="px-4 py-2 rounded-xl text-xs font-display font-semibold text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isRemoving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRemoving ? "Retrait..." : "Retirer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-surface-container-highest border border-primary/50 text-white text-xs font-display font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}


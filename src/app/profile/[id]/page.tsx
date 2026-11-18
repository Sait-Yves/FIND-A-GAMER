"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Monitor,
  Gamepad2,
  Edit,
  Star,
  ShieldCheck,
  Award,
  Info,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "AlexVortex";
  const isToxicDemo = rawId === "ToxicGamer_99" || rawId.toLowerCase().includes("toxic");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"games" | "reviews">("games");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Données de profil enrichies et fiabilisées par défaut
  const [user, setUser] = useState({
    username: isToxicDemo ? "ToxicGamer_99" : rawId,
    avatarUrl: isToxicDemo
      ? "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
      : "/avatars/avatar-alex.svg",
    bio: isToxicDemo
      ? "Hardstuck Platine. Marre des noobs qui savent pas jouer. Si vous écoutez pas mes ordres et mes strats, je déco direct de la ranked."
      : "Joueur compétitif sur Valorant et CS2. Toujours fair-play, focus endgame et communication claire. N'hésitez pas à me ping pour des ranked !",
    age: isToxicDemo ? 19 : 24,
    primaryPlatform: "PC",
    playerType: "COMPETITIVE",
    reputationScore: isToxicDemo ? 18.5 : 96.5,
    totalReviews: isToxicDemo ? 3 : 12,
    lastActive: isToxicDemo ? "Il y a 12 minutes" : "Il y a 3 minutes",
    favoriteGames: isToxicDemo
      ? [
          {
            id: 4200,
            title: "Counter-Strike 2",
            slug: "counter-strike-2",
            coverUrl: "/games/counter-strike-2.svg",
            hours: "1 250h de jeu",
          },
        ]
      : [
          {
            id: 415171,
            title: "Valorant",
            slug: "valorant",
            coverUrl: "/games/valorant.svg",
            hours: "340h de jeu",
          },
          {
            id: 4200,
            title: "Portal 2",
            slug: "portal-2",
            coverUrl: "/games/portal-2.svg",
            hours: "85h de jeu",
          },
          {
            id: 3498,
            title: "Grand Theft Auto V",
            slug: "grand-theft-auto-v",
            coverUrl: "/games/grand-theft-auto-v.svg",
            hours: "210h de jeu",
          },
        ],
    reviews: isToxicDemo
      ? [
          {
            id: "t1",
            author: "SarahChill",
            rating: 1,
            date: "Hier",
            comment: "Insulte ses coéquipiers dès le round 2, refuse d'écouter les callouts et rage quit dès sa première mort en pleine ranked !",
            tags: ["RAGE_QUIT", "TOXIC"],
          },
          {
            id: "t2",
            author: "AlexVortex",
            rating: 1,
            date: "Il y a 2 jours",
            comment: "Micro coupé tout le match puis hurle au micro quand il meurt en solo. Attitude toxique et aucun esprit d'équipe.",
            tags: ["TOXIC", "NO_MIC", "RAGE_QUIT"],
          },
          {
            id: "t3",
            author: "Valkyrie_FR",
            rating: 1,
            date: "Il y a 4 jours",
            comment: "Comportement inacceptable. Zéro esprit d'équipe, blame les autres et insulte tout le lobby en vocal.",
            tags: ["TOXIC", "RAGE_QUIT"],
          },
        ]
      : [
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
  });

  // Charger les données réelles du joueur depuis l'API si disponibles
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(rawId)}`);
        const json = await res.json();
        if (json.success && json.user) {
          const dbU = json.user;
          setUser((prev) => ({
            ...prev,
            username: dbU.username || rawId,
            avatarUrl: dbU.avatarUrl || "/avatars/avatar-default.svg",
            bio: dbU.bio || prev.bio,
            age: dbU.age || prev.age,
            primaryPlatform: dbU.primaryPlatform || prev.primaryPlatform,
            playerType: dbU.playerType || prev.playerType,
            reputationScore: dbU.reputationScore ?? prev.reputationScore,
            totalReviews: dbU.totalReviews ?? prev.totalReviews,
            favoriteGames:
              dbU.favoriteGames && dbU.favoriteGames.length > 0
                ? dbU.favoriteGames.map((g: any) => ({
                    id: g.rawgGameId,
                    title: g.gameTitle,
                    slug: g.gameSlug,
                    coverUrl: g.gameCoverUrl || "/games/default-game.svg",
                    hours: "Favori",
                  }))
                : prev.favoriteGames,
            reviews:
              dbU.reviewsReceived && dbU.reviewsReceived.length > 0
                ? dbU.reviewsReceived.map((r: any) => ({
                    id: r.id,
                    author: r.reviewer?.username || "Anonyme",
                    rating: r.rating,
                    date: new Date(r.createdAt).toLocaleDateString("fr-FR"),
                    comment: r.comment || "Aucun commentaire.",
                    tags: Array.isArray(r.tags)
                      ? r.tags
                      : typeof r.tags === "string"
                      ? JSON.parse(r.tags)
                      : [],
                  }))
                : prev.reviews,
          }));
        }

        // Vérifier également qui est connecté pour afficher ou masquer "Modifier le profil"
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user) {
          setCurrentUser(meJson.user);
        }
      } catch (err) {
        console.warn("Profil fallback affiché:", err);
      }
    }
    loadUser();
  }, [rawId]);

  // État et gestion de la relation d'amitié
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [isFriendLoading, setIsFriendLoading] = useState<boolean>(false);
  const [friendFeedback, setFriendFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function checkFriendStatus() {
      try {
        const res = await fetch(`/api/friends/status?username=${encodeURIComponent(user.username)}`);
        const json = await res.json();
        setIsFriend(!!json.isFriend);
      } catch {
        setIsFriend(false);
      }
    }
    if (user.username) {
      checkFriendStatus();
    }
  }, [user.username]);

  const toggleFriendship = async () => {
    setIsFriendLoading(true);
    setFriendFeedback(null);
    try {
      if (isFriend) {
        const res = await fetch("/api/friends", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
        const json = await res.json();
        if (json.success) {
          setIsFriend(false);
          setFriendFeedback(`@${user.username} a été retiré de vos amis.`);
        }
      } else {
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user.username }),
        });
        const json = await res.json();
        if (json.success) {
          setIsFriend(true);
          setFriendFeedback(`@${user.username} a été ajouté à vos amis !`);
        }
      }
    } catch (e) {
      console.error("Erreur amitié:", e);
    } finally {
      setIsFriendLoading(false);
      setTimeout(() => setFriendFeedback(null), 3000);
    }
  };

  const BADGE_DETAILS: Record<string, { label: string; color: string; desc: string }> = {
    FAIR_PLAY: { label: "Fair-Play Exemplaire", color: "text-primary border-primary/40 bg-primary/10", desc: "Respectueux des règles et coéquipiers" },
    GOOD_COMMUNICATION: { label: "Bonne Communication", color: "text-tertiary border-tertiary/40 bg-tertiary/10", desc: "Callouts précis, vocal clair" },
    TEAM_PLAYER: { label: "Esprit d'Équipe", color: "text-secondary border-secondary/40 bg-secondary/10", desc: "Joue l'objectif collectif" },
    LEADER: { label: "Leader Positif", color: "text-white border-white/40 bg-white/10", desc: "Motive et guide l'escouade" },
    PATIENT: { label: "Patient & Pédagogue", color: "text-primary border-primary/40 bg-primary/10", desc: "Aide sans jamais rager" },
    PUNCTUAL: { label: "Ponctuel", color: "text-tertiary border-tertiary/40 bg-tertiary/10", desc: "Présent à l'heure convenue" },
    RAGE_QUIT: { label: "Rage Quit / Abandon", color: "text-error border-error/50 bg-error/15 shadow-[0_0_8px_rgba(239,68,68,0.25)]", desc: "A quitté la partie en cours de jeu" },
    TOXIC: { label: "Comportement Toxique / Flame", color: "text-error border-error/50 bg-error/15 shadow-[0_0_8px_rgba(239,68,68,0.25)]", desc: "Insultes ou attitude nocive en partie" },
    NO_MIC: { label: "Micro Absent / Coupé", color: "text-error border-error/50 bg-error/15 shadow-[0_0_8px_rgba(239,68,68,0.25)]", desc: "Pas de micro malgré consigne obligatoire" },
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
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
                    onError={(e) => {
                      e.currentTarget.src = "/avatars/avatar-default.svg";
                    }}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/50 shadow-md bg-surface-container"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-surface animate-pulse" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-display font-bold text-white tracking-wide">
                      @{user.username}
                    </h1>
                    {user.reputationScore < 50 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-error/15 text-error border border-error/30 uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        Signalé — Comportement Négatif
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-primary/15 text-primary border border-primary/30 uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Vérifié Fair-Play
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1.5 text-white">
                      <Monitor className="w-3.5 h-3.5 text-primary" />
                      {user.primaryPlatform}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-tertiary font-medium">
                      <Gamepad2 className="w-3.5 h-3.5" />
                      {user.playerType}
                    </span>
                    <span>•</span>
                    <span>{user.age} ans</span>
                    <span>•</span>
                    <span className="text-primary font-medium">Actif : {user.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Edit / Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                {currentUser?.username === user.username || (!currentUser && (rawId === "AlexVortex" || rawId === "me")) ? (
                  <Link
                    href="/profile/edit"
                    className="flex-1 sm:flex-none text-center px-4 py-2 bg-surface-container hover:bg-surface-container-high text-white text-xs font-display font-bold rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-primary" />
                    Modifier le Profil
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleFriendship}
                      disabled={isFriendLoading}
                      aria-label={isFriend ? `Retirer ${user.username} de vos amis` : `Ajouter ${user.username} en ami`}
                      className={`group flex-1 sm:flex-none px-4 py-2 text-xs font-display font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                        isFriend
                          ? "bg-secondary/15 hover:bg-error/20 text-secondary hover:text-error border border-secondary/30 hover:border-error/40"
                          : "bg-primary hover:bg-primary-fixed text-on-primary shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                      }`}
                    >
                      {isFriendLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isFriend ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 group-hover:hidden" />
                          <UserMinus className="w-3.5 h-3.5 hidden group-hover:inline-block" />
                        </>
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      {isFriend ? (
                        <>
                          <span className="group-hover:hidden">Ami ✓</span>
                          <span className="hidden group-hover:inline">Retirer</span>
                        </>
                      ) : (
                        "Ajouter en ami"
                      )}
                    </button>

                    <Link
                      href={`/messages?user=${encodeURIComponent(user.username)}`}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-surface-container hover:bg-surface-container-high text-white text-xs font-display font-bold rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      aria-label={`Envoyer un message à ${user.username}`}
                    >
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Envoyer un Message
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Friend action feedback notification */}
            {friendFeedback && (
              <div
                role="status"
                className="mt-3 text-xs text-primary bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fade-in"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                <span>{friendFeedback}</span>
              </div>
            )}

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
                <span className={`text-lg font-display font-bold mt-1 ${user.reputationScore < 50 ? "text-error" : "text-primary"}`}>
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
                <span className={`text-lg font-display font-bold mt-1 ${user.reputationScore < 50 ? "text-error" : "text-secondary"}`}>
                  {user.reputationScore < 50 ? "35% (Abandons fréquents)" : "98% sans abandon"}
                </span>
              </div>

              <div className="p-3 bg-surface-container rounded-xl flex flex-col">
                <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">
                  Salons Hébergés
                </span>
                <span className="text-lg font-display font-bold text-tertiary mt-1">
                  {user.reputationScore < 50 ? "1 salon (Solo)" : "24 tickets créés"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Jeux Favoris & Évaluations) */}
          <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
            <button
              onClick={() => setActiveTab("games")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "games"
                  ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(78,222,163,0.3)]"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Jeux Favoris (RAWG)
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
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
            <div className="flex flex-col gap-4">
              {currentUser?.username === user.username && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1">
                  <span className="text-xs text-on-surface-variant">
                    Ces jeux sont affichés sur votre profil public. Cliquez sur un jeu pour explorer ses salons LFG.
                  </span>
                  <Link
                    href="/profile/edit#games"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-xs font-display font-semibold text-primary transition-colors shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier mes jeux favoris</span>
                  </Link>
                </div>
              )}

              {user.favoriteGames.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-container-low border border-surface-container-high text-center flex flex-col items-center justify-center gap-3">
                  <Gamepad2 className="w-8 h-8 text-on-surface-variant/40" />
                  <p className="text-xs text-on-surface-variant">
                    Aucun jeu favori configuré pour le moment.
                  </p>
                  <Link
                    href="/games"
                    className="px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary font-display font-bold text-xs rounded-xl transition-all"
                  >
                    Parcourir le catalogue de jeux
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.favoriteGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/?game=${encodeURIComponent(game.title)}`}
                      className="group relative rounded-2xl overflow-hidden bg-surface-container-low border border-surface-container-high hover:border-primary/60 hover:shadow-[0_4px_20px_rgba(78,222,163,0.12)] transition-all shadow-md flex flex-col cursor-pointer"
                    >
                      <div className="h-40 overflow-hidden bg-surface-container relative">
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          onError={(e) => {
                            e.currentTarget.src = "/games/default-game.svg";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-surface/90 backdrop-blur-md text-[10px] font-mono font-bold text-primary border border-primary/30 flex items-center gap-1 group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
                          <span>Explorer les salons</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-1">
                        <h3 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors">
                          {game.title}
                        </h3>
                        <span className="text-[11px] text-on-surface-variant">{game.hours}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Reputation Reviews & Badges Explanation */}
          {activeTab === "reviews" && (
            <div className="flex flex-col gap-5">
              {/* Educational Card: Comment les badges sont attribués */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Comment sont attribués les badges de comportement ?
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-on-surface-variant pt-2">
                  <div className="p-3 bg-surface-container rounded-xl flex flex-col gap-1.5">
                    <span className="font-display font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" /> 1. Match Partagé
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      L'évaluation n'est possible qu'entre coéquipiers ayant joué ensemble dans le même salon de jeu (ticket LFG validé). L'auto-évaluation est impossible.
                    </p>
                  </div>

                  <div className="p-3 bg-surface-container rounded-xl flex flex-col gap-1.5">
                    <span className="font-display font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-tertiary" /> 2. Vote Post-Match
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      À la fin d'une partie, chaque joueur attribue une note (1 à 5 étoiles) et peut cocher jusqu'à 5 badges comportementaux décrivant l'expérience vécue.
                    </p>
                  </div>

                  <div className="p-3 bg-surface-container rounded-xl flex flex-col gap-1.5">
                    <span className="font-display font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> 3. Score de Karma
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      La réputation se met à jour en temps réel. Les profils à 95%+ obtiennent le badge "Vérifié Fair-Play" et grimpent au Classement Élite.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
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
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-on-surface leading-relaxed">{rev.comment}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {rev.tags.map((t) => {
                        const info = BADGE_DETAILS[t] || { label: t.replace("_", " "), color: "text-primary border-primary/20 bg-primary/10", desc: "" };
                        return (
                          <span
                            key={t}
                            title={info.desc}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold border ${info.color} flex items-center gap-1`}
                          >
                            <Award className="w-3 h-3" />
                            {info.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

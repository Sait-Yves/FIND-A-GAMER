"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  UserPlus,
  Settings,
  LogOut,
  Gamepad2,
  Activity,
  Monitor,
  Shield,
  Mic,
  CheckCircle2,
  Users,
  RefreshCw,
  Share2,
  Sliders,
  Volume2,
  MessageSquare,
  Info,
  Smile,
  Send,
  AlertCircle,
  LogIn,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { VoiceRoomWidget } from "@/components/voice/VoiceRoomWidget";
import { VoiceParticipant } from "@/hooks/useVoiceCall";

export default function TicketRoomPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = (params?.id as string) || "";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Messages & Chat
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isReady, setIsReady] = useState(true);
  const [chatTab, setChatTab] = useState<"chat" | "logs">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Actions
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [activeOtherRoomId, setActiveOtherRoomId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // Charger la session utilisateur
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
        }
      } catch (e) {
        console.error("Erreur chargement session:", e);
      }
    }
    loadUser();
  }, []);

  // Charger les données du ticket
  const fetchTicketData = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tickets/${ticketId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Ticket introuvable");
      }

      setTicket(json.data);
    } catch (err: any) {
      setError(err.message || "Impossible de charger le salon");
    } finally {
      setLoading(false);
    }
  };

  // Charger les messages du chat
  const fetchMessages = async () => {
    if (!ticketId) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data);
      }
    } catch (e) {
      console.warn("Échec récupération messages:", e);
    }
  };

  useEffect(() => {
    fetchTicketData();
    fetchMessages();
  }, [ticketId]);

  // Scroll automatique au dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Déterminer le statut de l'utilisateur vis-à-vis du salon
  const isHost = ticket && currentUser && ticket.hostId === currentUser.id;
  const isParticipant =
    ticket &&
    currentUser &&
    ticket.participants?.some(
      (p: any) => p.userId === currentUser.id && p.status === "ACCEPTED"
    );
  const isInRoom = isHost || isParticipant;

  // Rejoindre le salon
  const handleJoin = async () => {
    setJoinError(null);
    setActiveOtherRoomId(null);
    setIsJoining(true);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setJoinError(json.error);
          setActiveOtherRoomId(json.activeTicketId || null);
          return;
        }
        throw new Error(json.error || "Échec de l'adhésion au salon");
      }

      // Recharger le salon pour entrer
      await fetchTicketData();
      await fetchMessages();
    } catch (err: any) {
      setJoinError(err.message || "Impossible de rejoindre ce salon");
    } finally {
      setIsJoining(false);
    }
  };

  // Quitter le salon
  const handleLeave = async () => {
    if (!confirm(isHost ? "Êtes-vous sûr de vouloir fermer et clôturer ce salon ?" : "Êtes-vous sûr de vouloir quitter ce salon ?")) {
      return;
    }

    setIsLeaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Échec de l'action de sortie");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la déconnexion du salon");
      setIsLeaving(false);
    }
  };

  // Envoi d'un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    const content = newMessage.trim();
    setNewMessage("");
    setIsSendingMessage(true);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser?.id,
          content,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data]);
      } else {
        await fetchMessages();
      }
    } catch (err) {
      console.error("Erreur envoi message:", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Pings rapides
  const handleQuickPing = (text: string) => {
    setNewMessage(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main
          id="main-content"
          tabIndex={-1}
          className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen flex items-center justify-center focus:outline-none"
        >
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
            <p className="text-xs font-display font-bold text-white tracking-wider uppercase">
              Connexion au Salon LFG...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main
          id="main-content"
          tabIndex={-1}
          className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen flex items-center justify-center focus:outline-none"
        >
          <div className="p-8 max-w-md w-full bg-surface-container-low rounded-2xl border border-surface-container-high text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-error" aria-hidden="true" />
            <h1 className="text-lg font-display font-bold text-white">Salon Introuvable</h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {error || "Ce ticket n'existe plus ou a été clôturé par son hôte."}
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-primary text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
            >
              Retourner aux Salons
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all focus:outline-none"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-5 w-full">
          {/* ========================================================================= */}
          {/* TICKET TOP HEADER: Matchmaking Squad Details & Quick Actions */}
          {/* ========================================================================= */}
          <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      ticket.status === "OPEN" ? "bg-primary animate-pulse" : "bg-tertiary"
                    }`}
                  />
                  <span className="text-[11px] font-display font-bold text-primary uppercase tracking-wider">
                    Salon {ticket.status === "OPEN" ? "Actif" : ticket.status} • LFG #{ticket.id.slice(-6).toUpperCase()}
                  </span>
                  {isHost && (
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">
                      👑 VOUS ÊTES L'HÔTE
                    </span>
                  )}
                  {isParticipant && !isHost && (
                    <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary text-[10px] font-bold">
                      ✓ MEMBRE D'ESCOUADE
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                  {ticket.title}{" "}
                  <span className="text-primary font-mono">[{ticket.gameTitle}]</span>
                </h1>
              </div>

              {/* Quick Action Badges */}
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-xl bg-surface-container font-mono text-xs font-bold text-primary border border-surface-container-high">
                  #ROOM-{ticket.id.slice(-6).toUpperCase()}
                </span>
                
                {isInRoom && (
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-error/15 hover:bg-error/25 text-error border border-error/30 text-xs font-display font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLeaving ? "Départ..." : isHost ? "Clôturer le Salon" : "Quitter"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rule Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-container-high/60">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-white flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-primary" />
                {ticket.gameTitle?.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-secondary flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" />
                {ticket.targetPlatform || "CROSSPLAY"}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-tertiary flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {ticket.requiredPlayerType || "COMPETITIVE"}
              </span>
              {ticket.micRequired && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-primary flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  Micro Obligatoire
                </span>
              )}
              {ticket.is18Plus && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-error flex items-center gap-1.5">
                  <span className="font-bold text-[10px] text-error">+18</span>
                  +18 Ans
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fair-Play Requis
              </span>
            </div>

            {/* Description & Host Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-surface-container rounded-xl border border-surface-container-high">
              <div className="flex items-center gap-3">
                <img
                  src={ticket.host?.avatarUrl || "/avatars/avatar-default.svg"}
                  alt={ticket.host?.username || "Host"}
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/avatar-default.svg";
                  }}
                  className="w-10 h-10 rounded-xl object-cover border border-primary/50 bg-surface"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-white">
                      @{ticket.host?.username}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      HÔTE
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Karma : {ticket.host?.reputationScore || 100}% ★ • {ticket.host?.primaryPlatform || "PC"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-bold text-white">
                  {ticket.currentPlayers} / {ticket.maxPlayers} Joueurs
                </span>
                <span className="text-[10px] font-semibold text-primary">
                  {ticket.maxPlayers - ticket.currentPlayers > 0
                    ? `${ticket.maxPlayers - ticket.currentPlayers} place(s) restante(s)`
                    : "Salon complet"}
                </span>
              </div>
            </div>

            {/* Custom Rules note if any */}
            {ticket.customRules && (
              <p className="text-xs text-on-surface-variant bg-surface-container/40 p-2.5 rounded-lg border border-surface-container-high/40">
                <strong className="text-white">Consignes de l'hôte :</strong> {ticket.customRules}
              </p>
            )}
          </div>

          {/* ========================================================================= */}
          {/* JOIN CALLOUT BANNER (if user is NOT yet in the room) */}
          {/* ========================================================================= */}
          {!isInRoom && (
            <div className="p-6 bg-gradient-to-r from-primary/15 via-surface-container-low to-secondary/15 rounded-2xl border-2 border-primary/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-display font-bold text-white">
                    Rejoindre cette escouade maintenant
                  </h2>
                </div>
                <p className="text-xs text-on-surface-variant max-w-xl">
                  En rejoignant ce salon, vous aurez accès au vocal d'escouade et au chat privé. Notez que vous ne pouvez appartenir qu'à un seul salon actif à la fois.
                </p>

                {joinError && (
                  <div className="mt-2 p-3 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-bold flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                    {activeOtherRoomId && (
                      <Link
                        href={`/tickets/${activeOtherRoomId}`}
                        className="self-start underline text-white hover:text-primary transition-colors text-[11px]"
                      >
                        Ouvrir mon salon actif pour le quitter →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-6 py-3 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_16px_rgba(78,222,163,0.35)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isJoining ? "Connexion..." : "Rejoindre l'Escouade"}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TWO-COLUMN LAYOUT: Left (Squad Members & Voice) + Right (Squad Chat) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (Squad Members & Voice) - 7 cols */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Squad Members Box */}
              <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                      Composition de l'Escouade ({ticket.currentPlayers}/{ticket.maxPlayers})
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    {ticket.targetPlatform || "CROSSPLAY"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Member 1: Host */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high">
                    <div className="flex items-center gap-3">
                      <img
                        src={ticket.host?.avatarUrl || "/avatars/avatar-default.svg"}
                        alt={ticket.host?.username || "Host"}
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/avatar-default.svg";
                        }}
                        className="w-11 h-11 rounded-xl object-cover bg-surface"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-white">
                            @{ticket.host?.username}
                          </span>
                          <span className="text-[10px] text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">
                            HÔTE
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {ticket.host?.playerType || "COMPETITIVE"} • {ticket.host?.primaryPlatform || "PC"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-display font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PRÊT
                      </span>
                    </div>
                  </div>

                  {/* Joined Participants */}
                  {ticket.participants?.map((p: any) => {
                    if (p.userId === ticket.hostId) return null;
                    const isYou = currentUser?.id === p.userId;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.user?.avatarUrl || "/avatars/avatar-default.svg"}
                            alt={p.user?.username || "Member"}
                            onError={(e) => {
                              e.currentTarget.src = "/avatars/avatar-default.svg";
                            }}
                            className="w-11 h-11 rounded-xl object-cover bg-surface"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-white">
                                @{p.user?.username}
                              </span>
                              {isYou && (
                                <span className="text-[10px] text-secondary font-bold px-1.5 py-0.5 rounded bg-secondary/10">
                                  VOUS
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-on-surface-variant">
                              {p.user?.playerType || "CHILL"} • {p.user?.primaryPlatform || "PC"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-display font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PRÊT
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Remaining Empty Slots */}
                  {Array.from({ length: Math.max(0, ticket.maxPlayers - ticket.currentPlayers) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary">
                          <RefreshCw className="w-4 h-4 animate-spin text-primary/60" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-white">
                            Place #{ticket.currentPlayers + i + 1} • En attente d'un joueur...
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            Recherche de profil : <strong>{ticket.requiredPlayerType || "Tous styles"}</strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-primary px-2.5 py-1 rounded bg-primary/10">
                        DISPONIBLE
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WebRTC Squad Voice Chat Widget Fonctionnel */}
              <VoiceRoomWidget
                roomName={ticket.title}
                defaultMembers={[
                  ...(ticket.host && ticket.host.id !== currentUser?.id
                    ? [
                        {
                          id: ticket.host.id,
                          username: ticket.host.username,
                          avatarUrl: ticket.host.avatarUrl || "/avatars/avatar-default.svg",
                          isSpeaking: false,
                          isMuted: false,
                          volume: 85,
                        },
                      ]
                    : []),
                  ...((ticket.participants || [])
                    .filter((p: any) => p.user?.id !== currentUser?.id && p.user?.id !== ticket.host?.id)
                    .map((p: any) => ({
                      id: p.user?.id || p.id,
                      username: p.user?.username || "Membre",
                      avatarUrl: p.user?.avatarUrl || "/avatars/avatar-default.svg",
                      isSpeaking: false,
                      isMuted: false,
                      volume: 80,
                    }))),
                ]}
                currentUsername={currentUser?.username || "Vous"}
                currentUserAvatar={currentUser?.avatarUrl || "/avatars/avatar-default.svg"}
              />
            </div>

            {/* Right Column (Squad Chat) - 5 cols */}
            <div className="lg:col-span-5 flex flex-col h-[640px] bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-lg">
              {/* Chat Tabs Header */}
              <div className="p-3.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    Chat d'Escouade
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                  <button
                    onClick={() => setChatTab("chat")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer ${
                      chatTab === "chat"
                        ? "bg-surface-container-high text-white"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Chat ({messages.length})
                  </button>
                  <button
                    onClick={() => setChatTab("logs")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer ${
                      chatTab === "logs"
                        ? "bg-surface-container-high text-white"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Infos
                  </button>
                </div>
              </div>

              {/* Room Goal Info Banner */}
              <div className="p-2.5 bg-surface-container-lowest text-center text-[11px] text-on-surface-variant border-b border-surface-container-high/60 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>
                  Hôte : <strong>@{ticket.host?.username}</strong> • Jeu : <strong>{ticket.gameTitle}</strong>
                </span>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-none">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
                    <MessageSquare className="w-8 h-8 text-on-surface-variant/40 mb-2" />
                    <p className="text-xs">Aucun message pour l'instant.</p>
                    <p className="text-[11px] text-on-surface-variant/60">
                      Dites bonjour à l'escouade pour lancer la session !
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isYou = currentUser?.id === msg.senderId;
                    const isMsgHost = ticket.hostId === msg.senderId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 max-w-[85%] ${
                          isYou ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                          <span className="font-display font-bold text-white">
                            @{msg.sender?.username || "Joueur"}
                          </span>
                          {isMsgHost && (
                            <span className="text-[9px] bg-primary/15 text-primary px-1 rounded font-bold">
                              Hôte
                            </span>
                          )}
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isYou
                              ? "bg-primary text-on-primary font-medium rounded-tr-none shadow-[0_0_12px_rgba(78,222,163,0.2)]"
                              : "bg-surface-container text-on-surface border border-surface-container-high rounded-tl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Pings Chips */}
              {isInRoom && (
                <div className="px-3 py-2 bg-surface-container border-t border-surface-container-high/60 flex items-center gap-2 text-[11px] overflow-x-auto">
                  <span className="text-on-surface-variant/70 uppercase font-display text-[9px] shrink-0">
                    Pings :
                  </span>
                  <button
                    onClick={() => handleQuickPing("🔥 Prêt à lancer !")}
                    className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    🔥 Prêt à lancer
                  </button>
                  <button
                    onClick={() => handleQuickPing("⏳ AFK 2 min")}
                    className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    ⏳ AFK 2 min
                  </button>
                  <button
                    onClick={() => handleQuickPing("🎯 Micro OK, on y va !")}
                    className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    🎯 Micro OK
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              {isInRoom ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-surface-container flex items-center gap-2 border-t border-surface-container-high"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire à l'escouade... (Entrée)"
                    className="flex-1 bg-surface-container-low text-xs text-white placeholder:text-on-surface-variant/60 rounded-xl px-3.5 py-2.5 border border-surface-container-high focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !newMessage.trim()}
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary flex items-center justify-center shadow-[0_0_10px_rgba(78,222,163,0.3)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-surface-container border-t border-surface-container-high text-center">
                  <p className="text-xs text-on-surface-variant">
                    Rejoignez ce salon pour accéder aux communications textuelles et vocales.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

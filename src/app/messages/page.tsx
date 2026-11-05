"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  PhoneCall,
  ExternalLink,
  Send,
  Users,
  Signal,
  CheckCircle2,
  Headphones,
  Sliders,
} from "lucide-react";
import { useVoiceCall } from "@/hooks/useVoiceCall";

interface MessageItem {
  id: string;
  sender: string;
  avatar: string;
  time: string;
  text: string;
  isMe: boolean;
}

export default function MessagesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChannelId, setActiveChannelId] = useState("apex-ranked");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger l'utilisateur connecté
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
        }
      } catch (e) {
        console.error("Erreur session messages:", e);
      }
    }
    loadUser();
  }, []);

  // Définition des salons / conversations
  const [channels, setChannels] = useState([
    {
      id: "apex-ranked",
      name: "TRIO RANKED — APEX #9482",
      game: "Apex Legends",
      badge: "Vocal Disponible",
      membersCount: 3,
      unread: 0,
      avatar: "/games/apex-legends.svg",
      targetLink: "/tickets/apex-trio-demo",
      voiceMembers: [
        {
          id: "m-1",
          username: "Noxis_FPS",
          avatarUrl: "/avatars/avatar-default.svg",
          isSpeaking: false,
          isMuted: false,
          volume: 85,
        },
        {
          id: "m-2",
          username: "Kaelen_Tank",
          avatarUrl: "/avatars/avatar-alex.svg",
          isSpeaking: false,
          isMuted: false,
          volume: 90,
        },
      ],
    },
    {
      id: "val-premier",
      name: "TOURNOI PREMIER — HAVEN",
      game: "Valorant",
      badge: "4/5 Joueurs",
      membersCount: 4,
      unread: 2,
      avatar: "/games/valorant.svg",
      targetLink: "/tickets/val-premier-demo",
      voiceMembers: [
        {
          id: "m-3",
          username: "Cypher_FR",
          avatarUrl: "/avatars/avatar-default.svg",
          isSpeaking: false,
          isMuted: false,
          volume: 80,
        },
        {
          id: "m-4",
          username: "Jett_Elite",
          avatarUrl: "/avatars/avatar-sarah.svg",
          isSpeaking: false,
          isMuted: false,
          volume: 85,
        },
      ],
    },
    {
      id: "dm-hiroshi",
      name: "@Hiroshi_89",
      game: "Message Privé",
      badge: "En Ligne",
      membersCount: 2,
      unread: 1,
      avatar: "/avatars/avatar-alex.svg",
      targetLink: "/profile/Hiroshi_89",
      voiceMembers: [
        {
          id: "m-5",
          username: "Hiroshi_89",
          avatarUrl: "/avatars/avatar-alex.svg",
          isSpeaking: false,
          isMuted: false,
          volume: 90,
        },
      ],
    },
  ]);

  // Messages séparés par conversation
  const [conversations, setConversations] = useState<Record<string, MessageItem[]>>({
    "apex-ranked": [
      {
        id: "1",
        sender: "Noxis_FPS",
        avatar: "/avatars/avatar-default.svg",
        time: "14:32",
        text: "Bienvenue dans le salon squad ! On part sur Storm Point en classé dans 5 minutes.",
        isMe: false,
      },
      {
        id: "2",
        sender: "Valkyrie_FR",
        avatar: "/avatars/avatar-sarah.svg",
        time: "14:34",
        text: "Je suis prête. J'ai lancé le vocal WebRTC et Apex est à jour. Je lock Valkyrie.",
        isMe: true,
      },
      {
        id: "3",
        sender: "Kaelen_Tank",
        avatar: "/avatars/avatar-alex.svg",
        time: "14:36",
        text: "Nickel, je prends Gibraltar pour la bulle et l'ult défensif. Let's go grind le Master !",
        isMe: false,
      },
    ],
    "val-premier": [
      {
        id: "v1",
        sender: "Cypher_FR",
        avatar: "/avatars/avatar-default.svg",
        time: "12:15",
        text: "Salut l'équipe ! On cale les setups de pièges sur Haven site A ce soir à 21h00.",
        isMe: false,
      },
      {
        id: "v2",
        sender: "Valkyrie_FR",
        avatar: "/avatars/avatar-sarah.svg",
        time: "12:18",
        text: "Bien reçu, j'ai bossé les lineups flèches sur C Long et garage.",
        isMe: true,
      },
      {
        id: "v3",
        sender: "Jett_Elite",
        avatar: "/avatars/avatar-sarah.svg",
        time: "12:20",
        text: "Rejoignez l'appel vocal dès que vous lancez le jeu, micro obligatoire !",
        isMe: false,
      },
    ],
    "dm-hiroshi": [
      {
        id: "h1",
        sender: "Hiroshi_89",
        avatar: "/avatars/avatar-alex.svg",
        time: "Hier",
        text: "Yo ! Chaud pour un duo classé ce soir après 20h ?",
        isMe: false,
      },
      {
        id: "h2",
        sender: "Valkyrie_FR",
        avatar: "/avatars/avatar-sarah.svg",
        time: "Hier",
        text: "Yes carrément chaud ! Ping-moi dès que tu te connectes.",
        isMe: true,
      },
      {
        id: "h3",
        sender: "Hiroshi_89",
        avatar: "/avatars/avatar-alex.svg",
        time: "14:10",
        text: "Ça marche, j'active le vocal direct sur LobbyGamer.",
        isMe: false,
      },
    ],
  });

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const currentMessages = conversations[activeChannelId] || [];

  // Hook WebRTC Voice Call dédié
  const {
    isInCall,
    isConnecting,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    participants,
    callDuration,
    joinCall,
    leaveCall,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
    toggleParticipantMute,
  } = useVoiceCall(activeChannel.voiceMembers);

  // Auto-scroll en bas de discussion
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Changer de conversation et réinitialiser les non-lus
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, unread: 0 } : c))
    );
  };

  // Envoi d'un message dans la conversation active
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const myName = currentUser?.username || "Valkyrie_FR";
    const myAvatar = currentUser?.avatarUrl || "/avatars/avatar-default.svg";

    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender: myName,
      avatar: myAvatar,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: messageText.trim(),
      isMe: true,
    };

    setConversations((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    setMessageText("");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Top Banner */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Communications & Escouades
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Messagerie & Salons Vocaux
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Discutez par écrit et rejoignez les appels vocaux d'escouade en direct avec audio spatialisé.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-display font-semibold text-primary shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>WebRTC RTC-04 Opérationnel (18ms)</span>
            </div>
          </div>

          {/* Grid Layout: Channels (left) & Chat Window (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[550px]">
            {/* Channels Column (4 cols) */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-2xl border border-surface-container-high p-4 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                  Salons & Conversations ({channels.length})
                </span>
                <span className="text-[10px] font-mono text-primary font-bold">En direct</span>
              </div>

              <div className="flex flex-col gap-2">
                {channels.map((chan) => {
                  const isActive = activeChannelId === chan.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-surface-container-high border-2 border-primary shadow-[0_0_15px_rgba(78,222,163,0.18)] scale-[1.01]"
                          : "bg-surface-container/60 hover:bg-surface-container border border-surface-container-high/60"
                      }`}
                    >
                      <img
                        src={chan.avatar}
                        alt={chan.name}
                        onError={(e) => {
                          e.currentTarget.src = "/games/default-game.svg";
                        }}
                        className="w-11 h-11 rounded-xl object-cover bg-surface border border-surface-container-high shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-display font-bold text-xs truncate ${
                              isActive ? "text-primary" : "text-white"
                            }`}
                          >
                            {chan.name}
                          </span>
                          {chan.unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                              {chan.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-0.5">
                          <span className="truncate">{chan.game}</span>
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              isActive ? "text-primary" : "text-on-surface-variant"
                            }`}
                          >
                            {chan.badge}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat & Voice Conversation Column (8 cols) */}
            <div className="lg:col-span-8 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col justify-between overflow-hidden shadow-md">
              {/* Chat & Voice Header */}
              <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isInCall ? "bg-primary animate-pulse" : "bg-primary/50"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-sm text-white">
                      {activeChannel.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {activeChannel.game} • {activeChannel.membersCount} membres •{" "}
                      {isInCall ? (
                        <strong className="text-primary">Vocal Actif ({callDuration})</strong>
                      ) : (
                        "Voix HD prête"
                      )}
                    </span>
                  </div>
                </div>

                {/* Voice Call Actions in Header */}
                <div className="flex items-center gap-2">
                  {isInCall ? (
                    <div className="flex items-center gap-1.5">
                      {/* Mute Button */}
                      <button
                        onClick={toggleMute}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isMuted
                            ? "bg-error/20 text-error border-error/40 hover:bg-error/30"
                            : "bg-surface-container-high text-primary border-primary/40 hover:bg-primary/20"
                        }`}
                        title={isMuted ? "Réactiver micro" : "Couper micro"}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Deafen Button */}
                      <button
                        onClick={toggleDeafen}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isDeafened
                            ? "bg-error/20 text-error border-error/40 hover:bg-error/30"
                            : "bg-surface-container-high text-tertiary border-tertiary/40 hover:bg-tertiary/20"
                        }`}
                        title={isDeafened ? "Rétablir son" : "Sourdine"}
                      >
                        {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Leave Voice Button */}
                      <button
                        onClick={leaveCall}
                        className="px-3 py-2 rounded-xl bg-error/20 hover:bg-error text-error hover:text-white text-xs font-display font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Quitter le vocal"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>Quitter</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={joinCall}
                      disabled={isConnecting}
                      className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-display font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(78,222,163,0.3)] hover:shadow-[0_0_18px_rgba(78,222,163,0.5)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{isConnecting ? "Connexion..." : "Rejoindre Vocal"}</span>
                    </button>
                  )}

                  <Link
                    href={activeChannel.targetLink}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface text-on-surface-variant hover:text-white transition-colors"
                    title="Voir le salon / profil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Active Voice Bar (if connected in call) */}
              {isInCall && (
                <div className="p-3 bg-surface border-b border-surface-container-high flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      <span className="font-mono font-bold text-primary">EN VOCAL ({callDuration})</span>
                    </div>

                    {/* Sound Level Meter */}
                    <div className="hidden sm:flex items-center gap-1.5 w-28">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className={`h-full transition-all duration-75 ${
                            isMuted ? "bg-error/40 w-0" : isSpeaking ? "bg-primary" : "bg-primary/40"
                          }`}
                          style={{ width: isMuted ? "0%" : `${Math.max(8, audioLevel)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {isMuted ? "OFF" : `${audioLevel}%`}
                      </span>
                    </div>
                  </div>

                  {/* Talking Participants Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-on-surface-variant">
                      {isSpeaking && !isMuted ? (
                        <span className="text-primary font-bold animate-pulse">
                          Vous parlez...
                        </span>
                      ) : (
                        "Micro ouvert"
                      )}
                    </span>
                    <div className="flex items-center -space-x-1.5">
                      <span
                        className={`w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white ${
                          isSpeaking && !isMuted ? "bg-primary text-black" : "bg-surface-container-high"
                        }`}
                        title="Vous"
                      >
                        V
                      </span>
                      {participants.map((p) => (
                        <span
                          key={p.id}
                          className={`w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white ${
                            p.isSpeaking && !p.isMuted ? "bg-primary text-black ring-1 ring-primary" : "bg-surface-container-high"
                          }`}
                          title={`@${p.username}`}
                        >
                          {p.username.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Feed for Active Conversation */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {currentMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant text-xs gap-2">
                    <MessageSquare className="w-8 h-8 text-on-surface-variant/40" />
                    <span>Aucun message dans ce salon pour le moment.</span>
                    <span className="text-[11px] text-primary">Envoyez le premier message !</span>
                  </div>
                ) : (
                  currentMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 max-w-xl ${
                        m.isMe ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      <img
                        src={m.avatar}
                        alt={m.sender}
                        onError={(e) => {
                          e.currentTarget.src = "/avatars/avatar-default.svg";
                        }}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 bg-surface border border-surface-container-high"
                      />
                      <div
                        className={`flex flex-col gap-1 p-3 rounded-2xl text-xs leading-relaxed ${
                          m.isMe
                            ? "bg-primary-container/20 text-white border border-primary/40 rounded-tr-none shadow-[0_0_10px_rgba(78,222,163,0.1)]"
                            : "bg-surface-container border border-surface-container-high text-on-surface rounded-tl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] text-on-surface-variant font-mono">
                          <span className={`font-semibold ${m.isMe ? "text-primary" : "text-white"}`}>
                            {m.sender}
                          </span>
                          <span>{m.time}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-surface-container border-t border-surface-container-high flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Envoyer un message dans ${activeChannel.name}...`}
                  className="flex-1 bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(78,222,163,0.25)] active:scale-95"
                >
                  <span>Envoyer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

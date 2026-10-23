"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function MessagesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState("apex-ranked");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "Noxis_FPS",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100",
      time: "14:32",
      text: "Bienvenue dans le salon squad ! On part sur Storm Point en classé dans 5 minutes.",
      isMe: false,
    },
    {
      id: "2",
      sender: "Valkyrie_FR",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      time: "14:34",
      text: "Je suis prête. J'ai lancé le vocal Discord et Apex est à jour. Je lock Valkyrie.",
      isMe: true,
    },
    {
      id: "3",
      sender: "Kaelen_Tank",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      time: "14:36",
      text: "Nickel, je prends Gibraltar pour la bulle et l'ult défensif. Let's go grind le Master !",
      isMe: false,
    },
  ]);

  const channels = [
    {
      id: "apex-ranked",
      name: "TRIO RANKED — APEX #9482",
      game: "Apex Legends",
      badge: "Vocal Actif",
      members: 3,
      unread: 0,
      avatar: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
    },
    {
      id: "val-premier",
      name: "TOURNOI PREMIER — HAVEN",
      game: "Valorant",
      badge: "4/5 Joueurs",
      members: 4,
      unread: 2,
      avatar: "https://media.rawg.io/media/games/7c4/7c448e89f81219b16ea91436cc5fb644.jpg",
    },
    {
      id: "dm-hiroshi",
      name: "@Hiroshi_89",
      game: "Message Privé",
      badge: "En Ligne",
      members: 2,
      unread: 1,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "Valkyrie_FR",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: messageText,
        isMe: true,
      },
    ]);
    setMessageText("");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-16 lg:pl-72 w-full min-h-screen p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Top Banner */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex items-center justify-between shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">chat</span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Communications & Escouades
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Messagerie & Salons Vocaux
              </h1>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-display font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>WebRTC Vocal Opérationnel</span>
            </div>
          </div>

          {/* Grid Layout: Channels (left) & Chat Window (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[500px]">
            {/* Channels Column */}
            <div className="lg:col-span-4 bg-surface-container-low rounded-2xl border border-surface-container-high p-4 flex flex-col gap-3 overflow-y-auto">
              <span className="text-[11px] font-display font-bold tracking-wider text-on-surface-variant uppercase">
                Salons & Conversations
              </span>

              <div className="flex flex-col gap-2">
                {channels.map((chan) => {
                  const isActive = activeChannel === chan.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => setActiveChannel(chan.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-surface-container-high border-2 border-primary shadow-[0_0_12px_rgba(78,222,163,0.15)]"
                          : "bg-surface-container/60 hover:bg-surface-container border border-surface-container-high/60"
                      }`}
                    >
                      <img
                        src={chan.avatar}
                        alt={chan.name}
                        className="w-10 h-10 rounded-lg object-cover bg-surface"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-xs text-white truncate">
                            {chan.name}
                          </span>
                          {chan.unread > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-on-primary">
                              {chan.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-0.5">
                          <span>{chan.game}</span>
                          <span className="text-primary font-medium">{chan.badge}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Conversation Column */}
            <div className="lg:col-span-8 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col justify-between overflow-hidden shadow-md">
              {/* Chat Header */}
              <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-sm text-white">
                      TRIO RANKED — APEX #9482
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      3 joueurs connectés • Voix HD activée
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-on-primary text-xs font-display font-bold transition-all flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">mic</span>
                    <span>Rejoindre Vocal</span>
                  </button>
                  <Link
                    href="/tickets/apex-trio-demo"
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface text-on-surface-variant hover:text-white transition-colors"
                    title="Voir le ticket"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </Link>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 max-w-xl ${
                      m.isMe ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <img
                      src={m.avatar}
                      alt={m.sender}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div
                      className={`flex flex-col gap-1 p-3 rounded-2xl text-xs leading-relaxed ${
                        m.isMe
                          ? "bg-primary-container/20 text-white border border-primary/40 rounded-tr-none"
                          : "bg-surface-container border border-surface-container-high text-on-surface rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-on-surface-variant font-mono">
                        <span className="font-semibold text-primary">{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-surface-container border-t border-surface-container-high flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrire un message d'escouade... (Entrée pour envoyer)"
                  className="flex-1 bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>Envoyer</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

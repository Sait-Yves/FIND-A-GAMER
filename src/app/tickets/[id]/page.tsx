"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function TicketRoomPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(true);
  const [chatTab, setChatTab] = useState<"chat" | "logs" | "map">("chat");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "Noxis_FPS",
      isHost: true,
      time: "14:32",
      content:
        "Yo ! Bienvenue @Valkyrie_FR. Tu gères bien Valkyrie sur Storm Point pour les rotations ult et scan de balises ?",
    },
    {
      id: "2",
      sender: "Valkyrie_FR",
      isHost: false,
      isYou: true,
      time: "14:33",
      content:
        "Salut ! Oui carrément, 4.2k kills sur Valkyrie. Je prends systématiquement les balises de reconnaissance et j'annonce les ultis avant la fermeture de zone.",
    },
    {
      id: "3",
      sender: "Noxis_FPS",
      isHost: true,
      time: "14:34",
      content:
        "Parfait ça ! J'attends un mate ou un bon solo Q Diamant 2+ et on lance sans tarder. Le code de groupe Apex est épinglé en haut.",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "Valkyrie_FR",
        isHost: false,
        isYou: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: newMessage,
      },
    ]);
    setNewMessage("");
  };

  const handleQuickPing = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "Valkyrie_FR",
        isHost: false,
        isYou: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: text,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="pt-16 lg:pl-72 w-full min-h-screen p-3 sm:p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 w-full">
        {/* ========================================================================= */}
        {/* TICKET TOP HEADER: Matchmaking Squad Details & Quick Actions */}
        {/* ========================================================================= */}
        <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-display font-bold text-primary uppercase tracking-wider">
                  Salon Actif • Matchmaking Squad • #APX-9482-T
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                TRIO RANKED — GRIND MASTER / DIAMANT II+{" "}
                <span className="text-primary">[Apex Legends]</span>
              </h1>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-xl bg-surface-container font-mono text-xs font-bold text-primary border border-surface-container-high">
                #LOBBY-9482-APEX
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 text-xs font-display font-bold transition-colors">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Inviter
              </button>
              <button
                title="Paramètres du salon"
                className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">settings</span>
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error/15 hover:bg-error/25 text-error border border-error/30 text-xs font-display font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Quitter
              </Link>
            </div>
          </div>

          {/* Rule Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-container-high/60">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-primary">sports_esports</span>
              APEX LEGENDS
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-primary">speed</span>
              EU Frankfurt (18ms)
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">devices</span>
              Crossplay ON
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-tertiary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">shield</span>
              Min. Diamant II
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">mic</span>
              Micro Obligatoire
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">explicit</span>
              +18 Ans
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-display font-bold bg-surface-container text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              Fair-Play Requis
            </span>
          </div>

          {/* Host Info & Progress Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-surface-container rounded-xl border border-surface-container-high">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100"
                alt="Host"
                className="w-9 h-9 rounded-xl object-cover border border-primary/50"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs text-white">@Noxis_FPS</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    HÔTE SQUAD
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  ★ 4.9/5 Fair-Play • 98% matches complétés • Steam: Noxis_TTV
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-on-surface-variant text-[11px]">Lobby ouvert depuis 06:24</span>
                <span className="w-16 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="w-2/3 h-full bg-primary rounded-full animate-pulse" />
                </span>
              </div>
              <span className="text-[10px] font-semibold text-primary">
                2/3 Joueurs prêts • Recherche d'un 3e coéquipier
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TWO-COLUMN LAYOUT: Left (Squad & WebRTC) + Right (Squad Chat) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (Squad Members & Voice) - 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Squad Members Box */}
            <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">
                    group
                  </span>
                  <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Composition de l'Escouade
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  FORMAT TRIO 3V3V3...
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Member 1: Host */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100"
                      alt="Host"
                      className="w-11 h-11 rounded-xl object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white">@Noxis_FPS</span>
                        <span className="text-[10px] text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">
                          HÔTE
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Bangalore • Fragger / Entry</span>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                        <span className="text-tertiary font-bold">DIAMANT I</span>
                        <span>•</span>
                        <span>11,450 RP</span>
                        <span>•</span>
                        <span>Steam: Noxis_TTV</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl animate-pulse">
                      graphic_eq
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-display font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      PRÊT
                    </span>
                  </div>
                </div>

                {/* Member 2: You (Valkyrie) */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="You"
                      className="w-11 h-11 rounded-xl object-cover border border-primary/40"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white">@Valkyrie_FR</span>
                        <span className="text-[10px] text-secondary font-bold px-1.5 py-0.5 rounded bg-secondary/10">
                          VOUS
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Valkyrie • Recon / Rotations</span>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                        <span className="text-tertiary font-bold">DIAMANT II</span>
                        <span>•</span>
                        <span>10,820 RP</span>
                        <span>•</span>
                        <span>Xbox: Valkyrie_ApexFR</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      mic
                    </span>
                    <button
                      onClick={() => setIsReady(!isReady)}
                      className={`px-4 py-2 rounded-xl text-xs font-display font-bold tracking-wider uppercase transition-all shadow-md ${
                        isReady
                          ? "bg-primary text-on-primary shadow-[0_0_14px_rgba(78,222,163,0.35)]"
                          : "bg-surface-container-high text-on-surface-variant hover:text-white"
                      }`}
                    >
                      {isReady ? "✓ JE SUIS PRÊT" : "PAS PRÊT"}
                    </button>
                  </div>
                </div>

                {/* Member 3: Empty Slot */}
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-primary animate-spin-slow">
                      <span className="material-symbols-outlined text-xl">sync</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-xs text-white">
                        Slot 3 • Recherche d'un coéquipier...
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Recommandé : <strong>Gibraltar / Catalyst</strong> • Diamant II+
                      </span>
                      <span className="text-[10px] text-primary mt-0.5">
                        4 joueurs consultent actuellement cette annonce LFG
                      </span>
                    </div>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-container text-white border border-surface-container-high rounded-xl text-xs font-display font-semibold transition-colors">
                    <span className="material-symbols-outlined text-sm">share</span>
                    Partager LFG
                  </button>
                </div>
              </div>
            </div>

            {/* WebRTC Squad Voice Chat Card */}
            <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    Vocal d'Escouade WebRTC
                  </h3>
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                    Frankfurt RTC-04
                  </span>
                </div>
                <button className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  Tester les périphériques audio
                </button>
              </div>

              {/* Audio Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-lg animate-pulse">
                      volume_up
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">@Noxis_FPS</span>
                      <span className="text-[10px] text-primary">En train de parler...</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    defaultValue={80}
                    className="w-20 accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-lg">
                      mic
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">@Valkyrie_FR (Vous)</span>
                      <span className="text-[10px] text-on-surface-variant">Micro ouvert (Krisp)</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    defaultValue={95}
                    className="w-20 accent-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high/60">
                <span>Mode d'activation : <strong className="text-white">Détection vocale auto</strong></span>
                <span>Raccourci PTT : <kbd className="px-1.5 py-0.5 rounded bg-surface border border-surface-container-high text-white font-mono">V</kbd></span>
              </div>
            </div>
          </div>

          {/* Right Column (Squad Chat) - 5 cols */}
          <div className="lg:col-span-5 flex flex-col h-[680px] bg-surface-container-low rounded-2xl border border-surface-container-high overflow-hidden shadow-lg">
            {/* Chat Tabs Header */}
            <div className="p-3.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  chat
                </span>
                <span className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  Chat d'Escouade
                </span>
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                <button
                  onClick={() => setChatTab("chat")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors ${
                    chatTab === "chat"
                      ? "bg-surface-container-high text-white"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Chat (3)
                </button>
                <button
                  onClick={() => setChatTab("logs")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors ${
                    chatTab === "logs"
                      ? "bg-surface-container-high text-white"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Journal Salon
                </button>
                <button
                  onClick={() => setChatTab("map")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-colors ${
                    chatTab === "map"
                      ? "bg-surface-container-high text-white"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Drop Map
                </button>
              </div>
            </div>

            {/* Room Goal Info Banner */}
            <div className="p-2.5 bg-surface-container-lowest text-center text-[11px] text-on-surface-variant border-b border-surface-container-high/60 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-primary">info</span>
              <span>Salon créé par <strong>@Noxis_FPS</strong> • Objectif : Push Master Diamant II+.</span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-none">
              {messages.map((msg) => {
                const isYou = msg.isYou;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      isYou ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                      <span className="font-display font-bold text-white">
                        @{msg.sender}
                      </span>
                      {msg.isHost && (
                        <span className="text-[9px] bg-primary/15 text-primary px-1 rounded font-bold">
                          Hôte
                        </span>
                      )}
                      <span>{msg.time}</span>
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
              })}
            </div>

            {/* Quick Pings Chips */}
            <div className="px-3 py-2 bg-surface-container border-t border-surface-container-high/60 flex items-center gap-2 text-[11px] overflow-x-auto">
              <span className="text-on-surface-variant/70 uppercase font-display text-[9px] shrink-0">
                Pings Rapides:
              </span>
              <button
                onClick={() => handleQuickPing("🔥 Prêt à drop !")}
                className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0"
              >
                🔥 Prêt à drop
              </button>
              <button
                onClick={() => handleQuickPing("⏳ 2 min AFK")}
                className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0"
              >
                ⏳ 2 min AFK
              </button>
              <button
                onClick={() => handleQuickPing("🎯 Je ping le Drop")}
                className="px-2 py-1 bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-white rounded-lg transition-colors shrink-0"
              >
                🎯 Drop
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-surface-container flex items-center gap-2 border-t border-surface-container-high">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Envoyer un message à l'escouade... [Entrée]"
                className="flex-1 bg-surface-container-low text-xs text-white placeholder:text-on-surface-variant/60 rounded-xl px-3.5 py-2.5 border border-surface-container-high focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-base">sentiment_satisfied</span>
              </button>
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary flex items-center justify-center shadow-[0_0_10px_rgba(78,222,163,0.3)] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

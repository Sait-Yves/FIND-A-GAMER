"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

export default function MyTicketsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hosted" | "joined">("hosted");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tickets");
      const json = await res.json();
      if (json.success && json.data) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error("Erreur chargement de mes tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-16 lg:pl-72 w-full min-h-screen p-4 md:p-6 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  confirmation_number
                </span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Gestion d'Escouade & Salons
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Mes Tickets LFG & Équipes
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Retrouvez les salons que vous avez créés ainsi que vos groupes actifs en attente de match.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_14px_rgba(78,222,163,0.3)] transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Créer un Salon
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
            <button
              onClick={() => setActiveTab("hosted")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                activeTab === "hosted"
                  ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(78,222,163,0.15)]"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">military_tech</span>
              <span>Mes Salons Hébergés (Hôte)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container font-mono">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("joined")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                activeTab === "joined"
                  ? "bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-[0_0_10px_rgba(76,215,246,0.15)]"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">group</span>
              <span>Salons Rejoints</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container font-mono">
                1
              </span>
            </button>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant">
              <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Chargement de vos tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-2xl border border-surface-container-high text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                sports_esports
              </span>
              <h3 className="text-sm font-display font-bold text-white mb-1">
                Aucun ticket actif pour l'instant
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mb-4">
                Créez votre première annonce LFG pour recruter des coéquipiers sérieux selon vos critères.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl"
              >
                Créer un Salon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="flex flex-col justify-between p-5 bg-surface-container-low rounded-2xl border border-surface-container-high hover:border-primary/50 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" />
                  <div className="flex flex-col gap-3 pl-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-display font-bold text-[10px] uppercase">
                        {ticket.gameTitle}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {ticket.targetPlatform}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-primary transition-colors">
                      {ticket.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {ticket.micRequired && (
                        <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-[10px] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">mic</span> Micro Requis
                        </span>
                      )}
                      {ticket.is18Plus && (
                        <span className="px-2 py-0.5 rounded bg-surface-container text-error text-[10px] font-semibold">
                          +18 ans
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary text-[10px] font-semibold">
                        {ticket.requiredPlayerType || "COMPETITIVE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-container-high/60 pl-2">
                    <div className="flex items-center gap-2 text-xs text-tertiary font-display font-semibold">
                      <span className="material-symbols-outlined text-base">group</span>
                      <span>
                        {ticket.currentPlayers} / {ticket.maxPlayers} Joueurs
                      </span>
                    </div>

                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all"
                    >
                      <span>Gérer le salon</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => fetchMyTickets()}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [micVolume, setMicVolume] = useState(85);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-16 lg:pl-72 w-full min-h-screen p-4 md:p-6 transition-all">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Configuration de la Plateforme
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Paramètres & Préférences
              </h1>
            </div>

            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Éditer Mon Profil Joueur
            </Link>
          </div>

          {/* Section 1: Audio & Voix WebRTC */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">mic</span>
              Audio & Paramètres Vocaux
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">Volume d'entrée Microphone</span>
                  <span className="font-mono text-primary font-bold">{micVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micVolume}
                  onChange={(e) => setMicVolume(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Suppression de bruit AI</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Atténue les bruits de frappe de clavier et ventilation
                  </span>
                </div>
                <input type="checkbox" defaultChecked className="accent-primary w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Section 2: Notifications & PWA */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">notifications</span>
              Notifications Push & PWA
            </h2>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Notifications Push Web</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Recevoir une alerte quand un joueur rejoint votre salon ou envoie un message
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Effets sonores dans le salon</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Bip sonore lorsqu'un joueur passe en statut "PRÊT"
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Intégrations Plateformes */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">link</span>
              Comptes & Plateformes Associées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
                <span className="text-xs font-bold text-white">Steam</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Connecté
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
                <span className="text-xs font-bold text-white">Xbox Live</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Connecté
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
                <span className="text-xs font-bold text-white">Discord</span>
                <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  Actif
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

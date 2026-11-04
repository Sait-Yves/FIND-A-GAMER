"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Sliders,
  Mic,
  Bell,
  Link2,
  LogOut,
  User,
  Shield,
  Volume2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [micVolume, setMicVolume] = useState(85);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Erreur déconnexion:", e);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Container avec espacement supérieur correct (pt-24) pour ne pas être masqué par la navbar */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 lg:pl-80 w-full min-h-screen transition-all">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <span className="text-xs font-display font-bold uppercase tracking-wider text-primary">
                  Configuration de la Plateforme
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Paramètres & Préférences
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Gérez vos périphériques vocaux, vos notifications et la sécurité de votre compte.
              </p>
            </div>

            <Link
              href="/profile/edit"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(78,222,163,0.3)] transition-all shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Éditer Mon Profil Joueur</span>
            </Link>
          </div>

          {/* Section 1: Compte & Déconnexion (Haute visibilité) */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Compte Joueur & Session</span>
            </h2>

            <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-primary/50"
                />
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white">
                    @{currentUser?.username || "Valkyrie_FR"}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {currentUser?.email || "valkyrie@lobbygamer.local"}
                  </span>
                  <span className="text-[10px] text-primary font-mono mt-0.5">
                    Session active • Rôle Joueur Vérifié
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2.5 bg-error/15 hover:bg-error text-error hover:text-on-error border border-error/40 font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow-[0_0_14px_rgba(255,180,171,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? "Déconnexion..." : "Se Déconnecter (Logout)"}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Audio & Voix WebRTC */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span>Audio & Paramètres Vocaux</span>
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span>Volume d'entrée Microphone</span>
                  </span>
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

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Suppression de bruit AI
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    Atténue les bruits de frappe de clavier mécanique et la ventilation
                  </span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notifications & PWA */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Notifications Push & PWA</span>
            </h2>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer hover:bg-surface-container-high/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Notifications Push Web</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
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

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer hover:bg-surface-container-high/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Effets sonores dans le salon</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    Bip sonore lorsqu'un coéquipier valide son statut "PRÊT"
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

          {/* Section 4: Intégrations Plateformes */}
          <div className="p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-sm">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>Comptes & Plateformes Associées</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
                <span className="text-xs font-bold text-white">Steam</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Connecté
                </span>
              </div>
              <div className="p-3.5 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
                <span className="text-xs font-bold text-white">Xbox Live</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Connecté
                </span>
              </div>
              <div className="p-3.5 bg-surface-container rounded-xl border border-surface-container-high flex items-center justify-between">
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

"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Download, X } from "lucide-react";

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  install: async () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ Service Worker LobbyGamer enregistré :", registration.scope);
          })
          .catch((error) => {
            console.warn("Échec d'enregistrement du Service Worker :", error);
          });
      });
    }

    // 2. Écoute de l'événement beforeinstallprompt (Chrome / Edge / Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 3. Détecter si l'application est déjà installée / exécutée en mode standalone
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
      setIsInstalled(true);
    }

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback si l'API automatique n'est pas déclenchée : avertir l'utilisateur
      alert(
        "Pour installer LobbyGamer :\n\n- Sur Chrome/Edge : Cliquez sur l'icône d'installation dans la barre d'adresse (en haut à droite).\n- Sur Mobile : Menu du navigateur > 'Ajouter à l'écran d'accueil'."
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        install: handleInstallClick,
      }}
    >
      {children}

      {/* Bannière discrète d'installation PWA 1-Click */}
      {isInstallable && !isDismissed && (
        <aside
          aria-label="Installation de l'application"
          className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-surface-container-low/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.svg"
              alt="LobbyGamer"
              className="w-10 h-10 rounded-xl object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-xs text-white truncate">
                Installer LobbyGamer
              </span>
              <span className="text-[11px] text-on-surface-variant leading-tight">
                Accès direct sans navigateur & mode hors-ligne
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-fixed text-on-primary font-display font-bold text-xs rounded-xl shadow-[0_0_10px_rgba(78,222,163,0.3)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors cursor-pointer"
              title="Fermer"
              aria-label="Fermer la suggestion d'installation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </PwaContext.Provider>
  );
}

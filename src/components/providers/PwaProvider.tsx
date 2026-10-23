"use client";

import { useEffect } from "react";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
  }, []);

  return <>{children}</>;
}

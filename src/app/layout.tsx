import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LobbyGamer — LFG & Salons de Matchmaking Gaming",
  description:
    "Trouvez des coéquipiers sérieux et bienveillants pour vos jeux multijoueurs préférés avec système de réputation et chat vocal/texte en direct.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4edea3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { PwaProvider } from "@/components/providers/PwaProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen overflow-x-hidden">
        {/* Lien d'évitement WCAG 2.2 SC 2.4.1 (Skip to content) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-on-primary focus:font-display focus:font-bold focus:rounded-xl focus:shadow-[0_0_20px_rgba(78,222,163,0.6)] focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all"
        >
          Passer directement au contenu principal
        </a>
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}

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
};

import { PwaProvider } from "@/components/providers/PwaProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-surface text-on-surface antialiased selection:bg-primary selection:text-on-primary">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}

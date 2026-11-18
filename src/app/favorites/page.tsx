"use client";

import GamesCatalogPage from "@/app/games/page";

/**
 * Route /favorites redirigée et alignée sur le Catalogue de Jeux officiel
 * (les jeux favoris de l'utilisateur sont désormais consultables directement sur son profil).
 */
export default function FavoritesPage() {
  return <GamesCatalogPage />;
}

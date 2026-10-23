import { RAWGGame, RAWGSearchResponse } from "@/types/rawg";

const RAWG_BASE_URL = "https://api.rawg.io/api";

/**
 * Service d'intégration pour l'API RAWG Video Games Database
 * Inclut la gestion du cache HTTP (revalidate Next.js) et le traitement des erreurs.
 */
export class RAWGService {
  private static getApiKey(): string {
    const key = process.env.RAWG_API_KEY || process.env.NEXT_PUBLIC_RAWG_API_KEY;
    if (!key) {
      console.warn("ATTENTION: RAWG_API_KEY n'est pas définie dans le fichier .env");
      return "";
    }
    return key;
  }

  /**
   * Recherche de jeux par mot-clé (utilisé pour les autocomplétions et tickets)
   */
  static async searchGames(query: string, pageSize: number = 10): Promise<RAWGGame[]> {
    const apiKey = this.getApiKey();
    if (!apiKey || !query.trim()) return [];

    try {
      const url = new URL(`${RAWG_BASE_URL}/games`);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("search", query);
      url.searchParams.set("page_size", pageSize.toString());
      url.searchParams.set("search_precise", "true");

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 }, // Cache Next.js pendant 1 heure
      });

      if (!response.ok) {
        throw new Error(`Erreur API RAWG: ${response.status} ${response.statusText}`);
      }

      const data: RAWGSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error("Échec lors de la recherche RAWG:", error);
      return [];
    }
  }

  /**
   * Récupère les détails d'un jeu précis via son ID RAWG
   */
  static async getGameById(rawgId: number): Promise<RAWGGame | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const url = `${RAWG_BASE_URL}/games/${rawgId}?key=${apiKey}`;
      const response = await fetch(url, {
        next: { revalidate: 86400 }, // Cache 24 heures pour les métadonnées statiques
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Erreur API RAWG: ${response.status}`);
      }

      const game: RAWGGame = await response.json();
      return game;
    } catch (error) {
      console.error(`Erreur récupération jeu RAWG #${rawgId}:`, error);
      return null;
    }
  }
}

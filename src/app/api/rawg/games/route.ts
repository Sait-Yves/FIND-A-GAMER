import { NextRequest, NextResponse } from "next/server";
import { RAWGService } from "@/lib/rawg";

export const dynamic = "force-dynamic";

/**
 * GET /api/rawg/games?search=valorant
 * Route proxy pour rechercher des jeux via l'API RAWG
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search") || "";
    const pageSize = searchParams.get("pageSize")
      ? parseInt(searchParams.get("pageSize")!)
      : 10;

    if (!query.trim()) {
      return NextResponse.json({ success: true, count: 0, results: [] });
    }

    const games = await RAWGService.searchGames(query, pageSize);

    return NextResponse.json({
      success: true,
      count: games.length,
      results: games.map((game) => ({
        id: game.id,
        name: game.name,
        slug: game.slug,
        coverUrl: game.background_image,
        rating: game.rating,
        metacritic: game.metacritic,
        platforms: game.platforms?.map((p) => p.platform.name) || [],
      })),
    });
  } catch (error) {
    console.error("Erreur GET /api/rawg/games:", error);
    return NextResponse.json(
      { error: "Échec de la recherche de jeux vidéo" },
      { status: 500 }
    );
  }
}

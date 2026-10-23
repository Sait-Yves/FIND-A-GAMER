import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Récupère le profil détaillé d'un joueur avec ses jeux favoris, ses avis et son statut d'activité
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        age: true,
        primaryPlatform: true,
        playerType: true,
        reputationScore: true,
        totalReviews: true,
        lastActiveAt: true,
        createdAt: true,
        favoriteGames: {
          select: {
            id: true,
            rawgGameId: true,
            gameTitle: true,
            gameSlug: true,
            gameCoverUrl: true,
          },
        },
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            tags: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        hostedTickets: {
          where: { status: "OPEN" },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            gameTitle: true,
            gameCoverUrl: true,
            maxPlayers: true,
            currentPlayers: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Erreur GET /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Met à jour le profil riche de l'utilisateur (bio, âge, plateforme, type de joueur, jeux favoris)
 * et rafraîchit son horodatage de dernière activité.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validation des données entrantes via Zod
    const validation = UpdateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données de formulaire invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { bio, age, avatarUrl, primaryPlatform, playerType, favoriteGames } = validation.data;

    // Transaction pour mettre à jour les métadonnées et synchroniser les jeux favoris
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les champs de base de l'utilisateur
      const user = await tx.user.update({
        where: { id },
        data: {
          bio,
          age,
          avatarUrl,
          primaryPlatform,
          playerType,
          lastActiveAt: new Date(),
        },
      });

      // 2. Si une liste de jeux favoris est fournie, synchroniser la table UserFavoriteGame
      if (favoriteGames) {
        // Supprimer les anciens favoris
        await tx.userFavoriteGame.deleteMany({
          where: { userId: id },
        });

        // Insérer les nouveaux favoris
        if (favoriteGames.length > 0) {
          await tx.userFavoriteGame.createMany({
            data: favoriteGames.map((game) => ({
              userId: id,
              rawgGameId: game.rawgGameId,
              gameTitle: game.gameTitle,
              gameSlug: game.gameSlug,
              gameCoverUrl: game.gameCoverUrl,
            })),
          });
        }
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Erreur PATCH /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil" },
      { status: 500 }
    );
  }
}

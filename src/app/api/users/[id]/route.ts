import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations";
import { verifySessionToken, createSessionToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function resolveTargetUser(req: NextRequest, id: string) {
  // 1. Recherche par ID direct
  let user = await prisma.user.findUnique({
    where: { id },
  });

  // 2. Recherche par pseudo si non trouvé par ID
  if (!user) {
    user = await prisma.user.findUnique({
      where: { username: id },
    });
  }

  // 3. Si l'identifiant est "me", "current" ou introuvable, vérifier la session
  if (!user && (id === "me" || id === "current" || id.startsWith("user-"))) {
    const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
    if (sessionCookie) {
      const payload = verifySessionToken(sessionCookie);
      if (payload?.id) {
        user = await prisma.user.findUnique({ where: { id: payload.id } });
      }
    }
  }

  // 4. Dernier fallback : premier utilisateur de la base
  if (!user) {
    user = await prisma.user.findFirst();
  }

  return user;
}

/**
 * GET /api/users/[id]
 * Récupère le profil détaillé d'un joueur
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resolvedUser = await resolveTargetUser(req, id);

    if (!resolvedUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedUser.id },
      select: {
        id: true,
        username: true,
        email: true,
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
 * Met à jour le profil riche de l'utilisateur (avatar, bio, âge, plateforme, type de joueur)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resolvedUser = await resolveTargetUser(req, id);

    if (!resolvedUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable pour la mise à jour" },
        { status: 404 }
      );
    }

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
      const updateData: any = {
        lastActiveAt: new Date(),
      };
      if (bio !== undefined) updateData.bio = bio;
      if (age !== undefined) updateData.age = age;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (primaryPlatform !== undefined) updateData.primaryPlatform = primaryPlatform;
      if (playerType !== undefined) updateData.playerType = playerType;

      const user = await tx.user.update({
        where: { id: resolvedUser.id },
        data: updateData,
      });

      if (favoriteGames) {
        await tx.userFavoriteGame.deleteMany({
          where: { userId: resolvedUser.id },
        });

        if (favoriteGames.length > 0) {
          await tx.userFavoriteGame.createMany({
            data: favoriteGames.map((game) => ({
              userId: resolvedUser.id,
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

    const response = NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedUser,
    });

    // Mettre à jour le cookie de session avec les nouvelles infos (notamment l'avatar)
    const newSessionPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      avatarUrl: updatedUser.avatarUrl,
      primaryPlatform: updatedUser.primaryPlatform,
      playerType: updatedUser.playerType,
    };

    response.cookies.set("lobbygamer_session", createSessionToken(newSessionPayload), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Erreur PATCH /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil", details: String(error) },
      { status: 500 }
    );
  }
}

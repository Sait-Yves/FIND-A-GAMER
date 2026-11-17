import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations";
import { verifySessionToken, createSessionToken, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const TOXIC_MOCK_USER = {
  id: "user-toxic-demo",
  username: "ToxicGamer_99",
  email: "toxic@gamer.fr",
  avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
  bio: "Hardstuck Platine. Marre des noobs qui savent pas jouer. Si vous écoutez pas mes ordres et mes strats, je déco direct de la ranked.",
  age: 19,
  primaryPlatform: "PC",
  playerType: "COMPETITIVE",
  reputationScore: 18.5,
  totalReviews: 3,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  favoriteGames: [
    {
      id: "fav-cs2",
      rawgGameId: 4200,
      gameTitle: "Counter-Strike 2",
      gameSlug: "counter-strike-2",
      gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
    },
  ],
  reviewsReceived: [
    {
      id: "rev-toxic-1",
      rating: 1,
      comment: "Insulte ses coéquipiers dès le round 2, refuse d'écouter les callouts et rage quit dès sa première mort en pleine ranked !",
      tags: ["RAGE_QUIT", "TOXIC"],
      createdAt: new Date(),
      reviewer: { id: "rev-1", username: "SarahChill", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    },
    {
      id: "rev-toxic-2",
      rating: 1,
      comment: "Micro coupé tout le match puis hurle au micro quand il meurt en solo. Attitude toxique et aucun esprit d'équipe.",
      tags: ["TOXIC", "NO_MIC", "RAGE_QUIT"],
      createdAt: new Date(),
      reviewer: { id: "rev-2", username: "AlexVortex", avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150" },
    },
    {
      id: "rev-toxic-3",
      rating: 1,
      comment: "Comportement inacceptable. Zéro esprit d'équipe et insulte tout le lobby en vocal.",
      tags: ["TOXIC", "RAGE_QUIT"],
      createdAt: new Date(),
      reviewer: { id: "rev-3", username: "Valkyrie_FR", avatarUrl: "/avatars/avatar-default.svg" },
    },
  ],
  hostedTickets: [
    {
      id: "demo-ticket-toxic-cs2",
      title: "[SOLO] CS2 PREMIER TRYHARD — NO NOOBS OR KICK",
      gameTitle: "Counter-Strike 2",
      gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
      maxPlayers: 5,
      currentPlayers: 1,
      createdAt: new Date(),
    },
  ],
};

async function resolveTargetUser(req: NextRequest, id: string) {
  try {
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

    // 3. Si l'identifiant est "me" ou "current", vérifier la session
    if (!user && (id === "me" || id === "current")) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        if (payload?.id) {
          user = await prisma.user.findUnique({ where: { id: payload.id } });
        }
      }
      if (!user) {
        user = await prisma.user.findFirst();
      }
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * GET /api/users/[id]
 * Récupère le profil détaillé d'un joueur
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Traitement prioritaire pour le profil de test toxique
    if (id.toLowerCase().includes("toxic") || id === "ToxicGamer_99" || id === "user-toxic-demo") {
      let dbUser: any = null;
      try {
        dbUser = await prisma.user.findFirst({
          where: { OR: [{ username: "ToxicGamer_99" }, { email: "toxic@gamer.fr" }] },
        });
      } catch {
        // DB non dispo
      }

      if (!dbUser) {
        return NextResponse.json({ success: true, data: TOXIC_MOCK_USER, user: TOXIC_MOCK_USER });
      }
    }

    const resolvedUser = await resolveTargetUser(req, id);

    if (!resolvedUser) {
      if (id.toLowerCase().includes("toxic") || id === "ToxicGamer_99" || id === "user-toxic-demo") {
        return NextResponse.json({ success: true, data: TOXIC_MOCK_USER, user: TOXIC_MOCK_USER });
      }

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

    return NextResponse.json({ success: true, data: user, user });
  } catch (error) {
    console.error("Erreur GET /api/users/[id]:", error);
    const { id } = await params;
    if (id.toLowerCase().includes("toxic") || id === "ToxicGamer_99" || id === "user-toxic-demo") {
      return NextResponse.json({ success: true, data: TOXIC_MOCK_USER, user: TOXIC_MOCK_USER });
    }
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

    response.cookies.set("lobbygamer_session", createSessionToken(newSessionPayload), SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Erreur PATCH /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || searchParams.get("query") || "").trim();

    if (!q || q.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        tickets: [],
      });
    }

    // Recherche des joueurs (username, bio)
    let users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { bio: { contains: q } },
        ],
      },
      take: 6,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        playerType: true,
        primaryPlatform: true,
        reputationScore: true,
        totalReviews: true,
      },
      orderBy: {
        reputationScore: "desc",
      },
    });

    // Recherche des salons / tickets ouverts (titre, jeu, description, hôte)
    let tickets = await prisma.ticket.findMany({
      where: {
        status: "OPEN",
        OR: [
          { title: { contains: q } },
          { gameTitle: { contains: q } },
          { description: { contains: queryClean(q) } },
          { host: { username: { contains: q } } },
        ],
      },
      take: 6,
      select: {
        id: true,
        title: true,
        gameTitle: true,
        gameCoverUrl: true,
        currentPlayers: true,
        maxPlayers: true,
        targetPlatform: true,
        micRequired: true,
        host: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fallbacks statiques si la base locale est vide pour donner une UX immédiate
    if (users.length === 0 && tickets.length === 0) {
      const mockUsers = [
        {
          id: "mock-1",
          username: "AlexVortex",
          avatarUrl: "/avatars/avatar-alex.svg",
          playerType: "COMPETITIVE",
          primaryPlatform: "PC",
          reputationScore: 96.5,
          totalReviews: 12,
        },
        {
          id: "mock-2",
          username: "SarahChill",
          avatarUrl: "/avatars/avatar-sarah.svg",
          playerType: "CHILL",
          primaryPlatform: "PLAYSTATION",
          reputationScore: 100.0,
          totalReviews: 8,
        },
        {
          id: "mock-3",
          username: "Valkyrie_FR",
          avatarUrl: "/avatars/avatar-default.svg",
          playerType: "COMPETITIVE",
          primaryPlatform: "CROSSPLAY",
          reputationScore: 98.0,
          totalReviews: 19,
        },
      ];

      const lowerQ = q.toLowerCase();
      users = mockUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(lowerQ) ||
          u.playerType.toLowerCase().includes(lowerQ)
      ) as any;
    }

    return NextResponse.json({
      success: true,
      query: q,
      users,
      tickets,
    });
  } catch (error) {
    console.error("Erreur API Search:", error);
    return NextResponse.json(
      { success: false, error: "Erreur recherche", users: [], tickets: [] },
      { status: 500 }
    );
  }
}

function queryClean(str: string): string {
  return str.replace(/[%_]/g, "\\$&");
}


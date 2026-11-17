import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tickets/[id]
 * Récupère le détail d'un ticket avec la liste de tous ses participants et son statut
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            reputationScore: true,
            playerType: true,
            primaryPlatform: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                reputationScore: true,
                playerType: true,
                primaryPlatform: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!ticket) {
      if (id.includes("toxic") || id === "demo-ticket-toxic-cs2") {
        return NextResponse.json({
          success: true,
          data: {
            id,
            title: "[SOLO] CS2 PREMIER TRYHARD — NO NOOBS OR KICK",
            description: "Lobby privé pour monter Global Elite. Je joue seul pour l'instant car tous mes anciens coéquipiers étaient nuls. Micro obligatoire et pas de débutants.",
            gameTitle: "Counter-Strike 2",
            gameSlug: "counter-strike-2",
            rawgGameId: 4200,
            gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
            maxPlayers: 5,
            currentPlayers: 1,
            micRequired: true,
            is18Plus: true,
            targetPlatform: "PC",
            requiredPlayerType: "COMPETITIVE",
            customRules: "Exécution immédiate des ordres ou kick",
            language: "FR",
            status: "OPEN",
            hostId: "user-toxic-demo",
            host: {
              id: "user-toxic-demo",
              username: "ToxicGamer_99",
              avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
              reputationScore: 18.5,
              totalReviews: 3,
              primaryPlatform: "PC",
              playerType: "COMPETITIVE",
            },
            participants: [
              {
                id: "part-toxic-host",
                userId: "user-toxic-demo",
                role: "HOST",
                status: "ACCEPTED",
                user: {
                  id: "user-toxic-demo",
                  username: "ToxicGamer_99",
                  avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
                  reputationScore: 18.5,
                  playerType: "COMPETITIVE",
                  primaryPlatform: "PC",
                },
              },
            ],
            _count: { messages: 0 },
          },
        });
      }
      return NextResponse.json(
        { error: "Ticket introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Erreur GET /api/tickets/[id]:", error);
    const { id } = await params;
    if (id.includes("toxic") || id === "demo-ticket-toxic-cs2") {
      return NextResponse.json({
        success: true,
        data: {
          id,
          title: "[SOLO] CS2 PREMIER TRYHARD — NO NOOBS OR KICK",
          description: "Lobby privé pour monter Global Elite. Je joue seul pour l'instant car tous mes anciens coéquipiers étaient nuls. Micro obligatoire et pas de débutants.",
          gameTitle: "Counter-Strike 2",
          gameSlug: "counter-strike-2",
          rawgGameId: 4200,
          gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
          maxPlayers: 5,
          currentPlayers: 1,
          micRequired: true,
          is18Plus: true,
          targetPlatform: "PC",
          requiredPlayerType: "COMPETITIVE",
          customRules: "Exécution immédiate des ordres ou kick",
          language: "FR",
          status: "OPEN",
          hostId: "user-toxic-demo",
          host: {
            id: "user-toxic-demo",
            username: "ToxicGamer_99",
            avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
            reputationScore: 18.5,
            totalReviews: 3,
            primaryPlatform: "PC",
            playerType: "COMPETITIVE",
          },
          participants: [
            {
              id: "part-toxic-host",
              userId: "user-toxic-demo",
              role: "HOST",
              status: "ACCEPTED",
              user: {
                id: "user-toxic-demo",
                username: "ToxicGamer_99",
                avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
                reputationScore: 18.5,
                playerType: "COMPETITIVE",
                primaryPlatform: "PC",
              },
            },
          ],
          _count: { messages: 0 },
        },
      });
    }
    return NextResponse.json(
      { error: "Impossible de charger le ticket" },
      { status: 500 }
    );
  }
}

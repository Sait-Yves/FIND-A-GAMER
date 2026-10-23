import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateTicketSchema } from "@/lib/validations";
import { Platform, TicketStatus } from "@prisma/client";

// Démos prédéfinies basées sur les maquettes Stitch
const DEFAULT_DEMO_TICKETS = [
  {
    title: "TRIO RANKED — GRIND MASTER / DIAMANT II+",
    description: "Cherche 1 joueur sérieux avec bon call et focus endgame. Pas de toxicité, rotation propre en zone. On joue Valkyrie / Bangalore combo. Objectif points RP constants.",
    gameTitle: "Apex Legends",
    gameSlug: "apex-legends",
    rawgGameId: 3498,
    gameCoverUrl: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
    maxPlayers: 3,
    currentPlayers: 2,
    micRequired: true,
    is18Plus: false,
    targetPlatform: "CROSSPLAY" as Platform,
    requiredPlayerType: "COMPETITIVE" as const,
    customRules: "Micro obligatoire, rotation zone rapide",
    language: "FR",
  },
  {
    title: "TOURNOI PREMIER — RECHERCHE DUEL / INITIATEUR",
    description: "Entraînement tactique pour la division Elite Premier. Strats calées sur Ascent et Haven. Lineups et flash synchronisées demandées. Bonne humeur garantie.",
    gameTitle: "Valorant",
    gameSlug: "valorant",
    rawgGameId: 415171,
    gameCoverUrl: "https://media.rawg.io/media/games/7c4/7c448e89f81219b16ea91436cc5fb644.jpg",
    maxPlayers: 5,
    currentPlayers: 4,
    micRequired: true,
    is18Plus: true,
    targetPlatform: "PC" as Platform,
    requiredPlayerType: "STRATEGIST" as const,
    customRules: "Lineups fixes, Discord obligatoire",
    language: "FR",
  },
  {
    title: "OPÉRATION NIVEAU 9 — HELLDIVE SUICIDE COOP",
    description: "Défense de Super-Terre sur le front Automaton. Quasar cannon et tourelles mortier requis. Extraction 100% échantillons roses assurée.",
    gameTitle: "Helldivers 2",
    gameSlug: "helldivers-2",
    rawgGameId: 968798,
    gameCoverUrl: "https://media.rawg.io/media/games/283/283e7300b0c83d0ab12521d80e604d92.jpg",
    maxPlayers: 4,
    currentPlayers: 3,
    micRequired: true,
    is18Plus: false,
    targetPlatform: "CROSSPLAY" as Platform,
    requiredPlayerType: "CHILL" as const,
    customRules: "Échantillons partagés, pas de tir allié intentionnel",
    language: "FR",
  },
  {
    title: "WARZONE 3 — RESURGENCE RANKED SQUAD",
    description: "Session nocturne tryhard top 1 sur Vondel. Rotation rapide, partage de plaques et munitions. Ratio 1.8+ souhaité.",
    gameTitle: "Warzone 2",
    gameSlug: "warzone-2",
    rawgGameId: 422,
    gameCoverUrl: "https://media.rawg.io/media/games/121/1213f000d367190048975e530000ec6d.jpg",
    maxPlayers: 4,
    currentPlayers: 2,
    micRequired: true,
    is18Plus: true,
    targetPlatform: "CROSSPLAY" as Platform,
    requiredPlayerType: "COMPETITIVE" as const,
    customRules: "Micro obligatoire, drop groupé",
    language: "FR",
  },
];

async function getOrCreateDefaultHost() {
  let host = await prisma.user.findFirst();
  if (!host) {
    host = await prisma.user.create({
      data: {
        username: "Valkyrie_FR",
        email: "valkyrie@lobbygamer.local",
        passwordHash: "$2a$10$wT8fSgY6oN.G8sQ61nQGheK1Z.8p9R5D6A7sB8cD9eF0gH1iJ2kLm",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        bio: "Spécialiste Apex Legends et Valorant. Micro actif, fair-play garanti !",
        age: 23,
        primaryPlatform: "PC",
        playerType: "COMPETITIVE",
        reputationScore: 98.4,
        totalReviews: 24,
      },
    });
  }
  return host;
}

/**
 * GET /api/tickets
 * Liste les tickets avec filtres : jeu, recherche textuelle, plateforme, micro, etc.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const game = searchParams.get("game");
    const rawgGameId = searchParams.get("rawgGameId")
      ? parseInt(searchParams.get("rawgGameId")!)
      : undefined;
    const platform = searchParams.get("platform") as Platform | undefined;
    const micRequired = searchParams.get("micRequired") === "true" ? true : undefined;
    const is18Plus = searchParams.get("is18Plus") === "true" ? true : undefined;
    const query = searchParams.get("q") || undefined;

    // Vérifier si la base contient des tickets. Si elle est vide, créer les tickets de démo
    const totalCount = await prisma.ticket.count();
    if (totalCount === 0) {
      const defaultHost = await getOrCreateDefaultHost();
      for (const demo of DEFAULT_DEMO_TICKETS) {
        const created = await prisma.ticket.create({
          data: {
            ...demo,
            hostId: defaultHost.id,
          },
        });
        await prisma.participant.create({
          data: {
            ticketId: created.id,
            userId: defaultHost.id,
            role: "HOST",
            status: "ACCEPTED",
          },
        });
      }
    }

    const whereClause: any = {
      status: "OPEN",
    };

    if (rawgGameId) {
      whereClause.rawgGameId = rawgGameId;
    }

    if (game && game !== "Tous" && game !== "all") {
      whereClause.gameTitle = { contains: game };
    }

    if (platform && platform !== ("ALL" as any)) {
      whereClause.targetPlatform = platform;
    }

    if (micRequired !== undefined) {
      whereClause.micRequired = micRequired;
    }

    if (is18Plus !== undefined) {
      whereClause.is18Plus = is18Plus;
    }

    if (query && query.trim() !== "") {
      whereClause.OR = [
        { title: { contains: query } },
        { gameTitle: { contains: query } },
        { description: { contains: query } },
        { customRules: { contains: query } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            reputationScore: true,
            playerType: true,
            totalReviews: true,
          },
        },
        participants: {
          where: { status: "ACCEPTED" },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    console.error("Erreur GET /api/tickets:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Crée un nouveau ticket de recherche de groupe (LFG) et y inscrit l'hôte en tant que premier participant accepté.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Récupération de l'identifiant de l'utilisateur
    let hostId = req.headers.get("x-user-id") || body.hostId;
    let host = null;

    if (hostId) {
      host = await prisma.user.findUnique({ where: { id: hostId } });
    }

    if (!host) {
      host = await getOrCreateDefaultHost();
    }

    hostId = host.id;

    // Validation Zod des paramètres du ticket
    const validation = CreateTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Paramètres de ticket invalides", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Transaction : création du ticket + insertion du créateur dans les participants avec le rôle HOST
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title: data.title,
          description: data.description,
          hostId,
          rawgGameId: data.rawgGameId,
          gameTitle: data.gameTitle,
          gameSlug: data.gameSlug,
          gameCoverUrl: data.gameCoverUrl || "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
          is18Plus: data.is18Plus,
          micRequired: data.micRequired,
          targetPlatform: data.targetPlatform,
          requiredPlayerType: data.requiredPlayerType || "COMPETITIVE",
          language: data.language || "FR",
          customRules: data.customRules,
          maxPlayers: data.maxPlayers,
          currentPlayers: 1, // L'hôte compte comme 1 joueur
          scheduledAt: data.scheduledAt,
          status: "OPEN",
        },
      });

      // L'hôte est automatiquement membre ACCEPTED avec le rôle HOST
      await tx.participant.create({
        data: {
          ticketId: ticket.id,
          userId: hostId,
          role: "HOST",
          status: "ACCEPTED",
        },
      });

      return ticket;
    });

    return NextResponse.json(
      { success: true, message: "Ticket créé avec succès", data: newTicket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST /api/tickets:", error);
    return NextResponse.json(
      { error: "Échec de la création du ticket", details: String(error) },
      { status: 500 }
    );
  }
}

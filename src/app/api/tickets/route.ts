import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateTicketSchema } from "@/lib/validations";
import { Platform, TicketStatus } from "@prisma/client";

/**
 * GET /api/tickets
 * Liste les tickets avec filtres : jeu RAWG, plateforme, micro obligatoire, +18, statut
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawgGameId = searchParams.get("rawgGameId")
      ? parseInt(searchParams.get("rawgGameId")!)
      : undefined;
    const platform = searchParams.get("platform") as Platform | undefined;
    const status = (searchParams.get("status") as TicketStatus) || "OPEN";
    const micRequired = searchParams.get("micRequired") === "true" ? true : undefined;
    const is18Plus = searchParams.get("is18Plus") === "true" ? true : undefined;
    const query = searchParams.get("q") || undefined;

    const tickets = await prisma.ticket.findMany({
      where: {
        status,
        ...(rawgGameId ? { rawgGameId } : {}),
        ...(platform ? { targetPlatform: platform } : {}),
        ...(micRequired !== undefined ? { micRequired } : {}),
        ...(is18Plus !== undefined ? { is18Plus } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query } },
                { gameTitle: { contains: query } },
                { description: { contains: query } },
              ],
            }
          : {}),
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            reputationScore: true,
            playerType: true,
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

    // Récupération de l'identifiant de l'utilisateur (issu du header ou de la session)
    // Dans une implémentation complète, ceci est extrait du token de session NextAuth / JWT
    const hostId = req.headers.get("x-user-id") || body.hostId;

    if (!hostId) {
      return NextResponse.json(
        { error: "Authentification requise pour créer un ticket" },
        { status: 401 }
      );
    }

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
          gameCoverUrl: data.gameCoverUrl,
          is18Plus: data.is18Plus,
          micRequired: data.micRequired,
          targetPlatform: data.targetPlatform,
          requiredPlayerType: data.requiredPlayerType,
          language: data.language,
          customRules: data.customRules,
          maxPlayers: data.maxPlayers,
          currentPlayers: 1, // L'hôte compte comme 1 joueur
          scheduledAt: data.scheduledAt,
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
      { error: "Échec de la création du ticket" },
      { status: 500 }
    );
  }
}

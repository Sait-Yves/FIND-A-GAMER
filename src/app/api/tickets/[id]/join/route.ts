import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tickets/[id]/join
 * Permet à un joueur de postuler ou de rejoindre un ticket.
 * Vérifie la capacité restante, les règles d'âge (+18) et l'unicité.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params;
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise pour rejoindre un ticket" },
        { status: 401 }
      );
    }

    // Récupération du ticket et du profil du candidat
    const [ticket, candidateUser] = await Promise.all([
      prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          participants: {
            where: { status: "ACCEPTED" },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ]);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    }

    if (!candidateUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // 1. Vérification du statut du salon
    if (ticket.status !== "OPEN") {
      return NextResponse.json(
        { error: "Ce salon n'accepte plus de nouveaux joueurs" },
        { status: 400 }
      );
    }

    // 2. Vérification de la capacité
    if (ticket.currentPlayers >= ticket.maxPlayers) {
      return NextResponse.json({ error: "Le salon est complet" }, { status: 400 });
    }

    // 3. Vérification de la règle +18
    if (ticket.is18Plus && candidateUser.age && candidateUser.age < 18) {
      return NextResponse.json(
        { error: "Ce salon est strictement réservé aux joueurs majeurs (+18)" },
        { status: 403 }
      );
    }

    // 4. Inscription ou mise à jour du participant en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier si une inscription existe déjà
      const existing = await tx.participant.findUnique({
        where: {
          ticketId_userId: {
            ticketId,
            userId,
          },
        },
      });

      if (existing && existing.status === "ACCEPTED") {
        throw new Error("ALREADY_JOINED");
      }

      const participant = existing
        ? await tx.participant.update({
            where: { id: existing.id },
            data: { status: "ACCEPTED", role: "MEMBER" },
          })
        : await tx.participant.create({
            data: {
              ticketId,
              userId,
              role: "MEMBER",
              status: "ACCEPTED",
            },
          });

      // Recalcul du nombre de joueurs
      const newPlayerCount = ticket.currentPlayers + 1;
      const isNowFull = newPlayerCount >= ticket.maxPlayers;

      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          currentPlayers: newPlayerCount,
          status: isNowFull ? "FULL" : "OPEN",
        },
      });

      return participant;
    });

    return NextResponse.json({
      success: true,
      message: "Vous avez rejoint le ticket avec succès",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "ALREADY_JOINED") {
      return NextResponse.json(
        { error: "Vous faites déjà partie de ce salon" },
        { status: 400 }
      );
    }
    console.error("Erreur POST /api/tickets/[id]/join:", error);
    return NextResponse.json(
      { error: "Impossible de rejoindre le salon" },
      { status: 500 }
    );
  }
}

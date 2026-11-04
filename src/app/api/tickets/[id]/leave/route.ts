import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

/**
 * POST /api/tickets/[id]/leave
 * Permet à un joueur de quitter un salon actif, ou à l'hôte d'annuler/clôturer son salon.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params;
    const body = await req.json().catch(() => ({}));

    // Résolution de l'utilisateur connecté via cookie de session ou headers/body
    let userId = req.headers.get("x-user-id") || body?.userId;
    if (!userId) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        if (payload?.id) {
          userId = payload.id;
        }
      }
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise pour quitter ce salon" },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        participants: {
          where: { status: "ACCEPTED" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    }

    const isHost = ticket.hostId === userId;

    await prisma.$transaction(async (tx) => {
      if (isHost) {
        // L'hôte quitte le salon -> Clôture / Annulation du ticket
        await tx.ticket.update({
          where: { id: ticketId },
          data: { status: "CANCELLED" },
        });

        await tx.participant.updateMany({
          where: { ticketId, status: "ACCEPTED" },
          data: { status: "LEFT" },
        });
      } else {
        // Un membre quitte le salon
        const participant = await tx.participant.findUnique({
          where: {
            ticketId_userId: {
              ticketId,
              userId,
            },
          },
        });

        if (participant) {
          await tx.participant.update({
            where: { id: participant.id },
            data: { status: "LEFT" },
          });

          // Décrémenter le nombre de joueurs et réouvrir le ticket si besoin
          const newCount = Math.max(1, ticket.currentPlayers - 1);
          await tx.ticket.update({
            where: { id: ticketId },
            data: {
              currentPlayers: newCount,
              status: "OPEN",
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: isHost ? "Le salon a été clôturé avec succès" : "Vous avez quitté le salon avec succès",
    });
  } catch (error: any) {
    console.error("Erreur POST /api/tickets/[id]/leave:", error);
    return NextResponse.json(
      { error: "Impossible de quitter le salon" },
      { status: 500 }
    );
  }
}

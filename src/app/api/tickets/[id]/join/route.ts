import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

/**
 * POST /api/tickets/[id]/join
 * Permet à un joueur de rejoindre un ticket.
 * Règle stricte : Un joueur ne peut participer qu'à un SEUL salon actif à la fois.
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

    // Fallback utilisateur par défaut si non connecté
    if (!userId) {
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentification requise pour rejoindre un ticket" },
        { status: 401 }
      );
    }

    // Récupération du ticket cible et de l'utilisateur
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

    // Règle A : Si l'utilisateur est le créateur/hôte de CE ticket
    if (ticket.hostId === userId) {
      return NextResponse.json({
        success: true,
        message: "Vous êtes l'hôte de ce salon",
        alreadyInRoom: true,
        isHost: true,
        data: { ticketId },
      });
    }

    // Règle B : Vérifier si l'utilisateur est DÉJÀ membre accepté de CE ticket
    const isAlreadyMemberOfThis = ticket.participants.some((p) => p.userId === userId);
    if (isAlreadyMemberOfThis) {
      return NextResponse.json({
        success: true,
        message: "Vous participez déjà à ce salon",
        alreadyInRoom: true,
        isHost: false,
        data: { ticketId },
      });
    }

    // Règle C (STRICTE) : Un joueur NE DOIT PAS pouvoir rejoindre plusieurs salons en même temps !
    // Vérification 1 : Est-il membre accepté d'un AUTRE ticket en cours ?
    const activeParticipation = await prisma.participant.findFirst({
      where: {
        userId,
        status: "ACCEPTED",
        ticketId: { not: ticketId },
        ticket: {
          status: { in: ["OPEN", "IN_PROGRESS", "FULL"] },
        },
      },
      include: {
        ticket: {
          select: {
            id: true,
            title: true,
            gameTitle: true,
          },
        },
      },
    });

    if (activeParticipation) {
      return NextResponse.json(
        {
          error: `Vous participez déjà à un salon actif ("${activeParticipation.ticket.title}"). Vous devez d'abord quitter votre salon actuel avant d'en rejoindre un autre.`,
          activeTicketId: activeParticipation.ticket.id,
          activeTicketTitle: activeParticipation.ticket.title,
        },
        { status: 409 }
      );
    }

    // Vérification 2 : Est-il l'hôte d'un AUTRE ticket actif ?
    const activeHostedTicket = await prisma.ticket.findFirst({
      where: {
        hostId: userId,
        id: { not: ticketId },
        status: { in: ["OPEN", "IN_PROGRESS", "FULL"] },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (activeHostedTicket) {
      return NextResponse.json(
        {
          error: `Vous êtes actuellement l'hôte d'un autre salon actif ("${activeHostedTicket.title}"). Vous devez clôturer votre salon avant d'en rejoindre un nouveau.`,
          activeTicketId: activeHostedTicket.id,
          activeTicketTitle: activeHostedTicket.title,
        },
        { status: 409 }
      );
    }

    // 1. Vérification du statut du salon cible
    if (ticket.status !== "OPEN") {
      return NextResponse.json(
        { error: "Ce salon est complet ou n'accepte plus de nouveaux joueurs" },
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
        { error: "Ce salon est strictement réservé aux joueurs majeurs (+18 ans)" },
        { status: 403 }
      );
    }

    // 4. Inscription ou mise à jour du participant en transaction atomique
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.participant.findUnique({
        where: {
          ticketId_userId: {
            ticketId,
            userId,
          },
        },
      });

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
      message: "Vous avez rejoint l'escouade avec succès !",
      data: result,
    });
  } catch (error: any) {
    console.error("Erreur POST /api/tickets/[id]/join:", error);
    return NextResponse.json(
      { error: error?.message || "Impossible de rejoindre le salon" },
      { status: 500 }
    );
  }
}

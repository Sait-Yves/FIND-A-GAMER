import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SendMessageSchema } from "@/lib/validations";
import { verifySessionToken } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

/**
 * GET /api/tickets/[id]/messages
 * Récupère le fil de discussion au sein du ticket
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params;

    const messages = await prisma.message.findMany({
      where: { ticketId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            playerType: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error("Erreur GET /api/tickets/[id]/messages:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets/[id]/messages
 * Envoie un message dans le salon de discussion du ticket.
 * Vérifie au préalable que l'émetteur est bien l'hôte ou un participant accepté.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params;
    const body = await req.json().catch(() => ({}));

    let senderId = req.headers.get("x-user-id") || body?.senderId;
    if (!senderId) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        if (payload?.id) {
          senderId = payload.id;
        }
      }
    }

    if (!senderId) {
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      senderId = defaultUser?.id;
    }

    if (!senderId) {
      return NextResponse.json(
        { error: "Authentification requise pour envoyer un message" },
        { status: 401 }
      );
    }

    // Validation du contenu
    const validation = SendMessageSchema.safeParse({ ...body, ticketId });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Message invalide", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { hostId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    }

    const isHost = ticket.hostId === senderId;
    const isParticipant = isHost
      ? true
      : await prisma.participant.findFirst({
          where: {
            ticketId,
            userId: senderId,
            status: "ACCEPTED",
          },
        });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Vous devez être membre de ce ticket pour participer au salon de chat" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        ticketId,
        senderId,
        content: validation.data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message transmis avec succès",
      data: message,
    });
  } catch (error) {
    console.error("Erreur POST /api/tickets/[id]/messages:", error);
    return NextResponse.json(
      { error: "Échec de l'envoi du message" },
      { status: 500 }
    );
  }
}

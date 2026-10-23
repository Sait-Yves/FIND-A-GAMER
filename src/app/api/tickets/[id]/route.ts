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
      return NextResponse.json(
        { error: "Ticket introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Erreur GET /api/tickets/[id]:", error);
    return NextResponse.json(
      { error: "Impossible de charger le ticket" },
      { status: 500 }
    );
  }
}

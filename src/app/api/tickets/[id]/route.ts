import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDemoTicket } from "@/lib/demo-tickets-store";

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

    // Vérifier si c'est un ticket démo géré par le store
    const demoTicket = getDemoTicket(id);
    if (demoTicket) {
      return NextResponse.json({
        success: true,
        data: {
          ...demoTicket,
          _count: { messages: demoTicket.messages.length },
        },
      });
    }

    let ticket: any = null;
    try {
      ticket = await prisma.ticket.findUnique({
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
    } catch {
      // Base non accessible
    }

    if (!ticket) {
      const fallbackDemo = getDemoTicket(id) || getDemoTicket("demo-ticket-toxic-cs2");
      if (id.includes("toxic") || id.includes("cs2") || id.startsWith("demo-")) {
        return NextResponse.json({
          success: true,
          data: fallbackDemo,
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
    const fallbackDemo = getDemoTicket(id) || getDemoTicket("demo-ticket-toxic-cs2");
    if (fallbackDemo) {
      return NextResponse.json({
        success: true,
        data: fallbackDemo,
      });
    }
    return NextResponse.json(
      { error: "Impossible de charger le ticket" },
      { status: 500 }
    );
  }
}

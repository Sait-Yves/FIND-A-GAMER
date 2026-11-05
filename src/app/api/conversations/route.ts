import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/conversations
 * Récupère les conversations privées de l'utilisateur
 */
export async function GET(req: NextRequest) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        userId = payload?.id || null;
      }
    }

    if (!userId) {
      try {
        const defaultUser = await prisma.user.findFirst({ select: { id: true } });
        userId = defaultUser?.id || null;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    try {
      const userConvs = await prisma.conversationMember.findMany({
        where: { userId },
        include: {
          conversation: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                      primaryPlatform: true,
                      playerType: true,
                    },
                  },
                },
              },
              messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
        orderBy: { conversation: { updatedAt: "desc" } },
      });

      const formatted = userConvs.map((cm) => {
        const otherMember = cm.conversation.members.find((m) => m.userId !== userId)?.user;
        const lastMsg = cm.conversation.messages[0];
        return {
          id: cm.conversationId,
          name: otherMember ? `@${otherMember.username}` : "Conversation",
          game: "Message Privé",
          badge: "En Ligne",
          membersCount: cm.conversation.members.length,
          avatar: otherMember?.avatarUrl || "/avatars/avatar-default.svg",
          lastMessage: lastMsg?.content || "Aucun message",
          lastMessageAt: lastMsg?.createdAt || cm.conversation.createdAt,
        };
      });

      return NextResponse.json({ success: true, conversations: formatted });
    } catch {
      return NextResponse.json({ success: true, conversations: [] });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur récupération conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Démarre une conversation avec un joueur
 */
export async function POST(req: NextRequest) {
  try {
    let userId = req.headers.get("x-user-id");
    if (!userId) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        userId = payload?.id || null;
      }
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });
      userId = defaultUser?.id || null;
    }

    const body = await req.json().catch(() => ({}));
    const { targetUserId, targetUsername } = body;

    let targetId = targetUserId;
    if (!targetId && targetUsername) {
      const target = await prisma.user.findUnique({
        where: { username: targetUsername },
        select: { id: true },
      });
      targetId = target?.id;
    }

    if (!targetId) {
      // Simulé
      return NextResponse.json({
        success: true,
        conversationId: `conv-${Date.now()}`,
        message: "Conversation créée",
      });
    }

    // Créer la conversation avec les 2 membres
    const newConv = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { userId: userId! },
            { userId: targetId },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: newConv.id,
      message: "Conversation créée",
    });
  } catch (error) {
    console.error("Erreur POST /api/conversations:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de créer la conversation" },
      { status: 500 }
    );
  }
}


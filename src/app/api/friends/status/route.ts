import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    const targetUsername = searchParams.get("username");

    if (!targetUserId && !targetUsername) {
      return NextResponse.json({ isFriend: false });
    }

    let currentUserId: string | null = req.headers.get("x-user-id");
    if (!currentUserId) {
      const sessionCookie = req.cookies.get("lobbygamer_session")?.value;
      if (sessionCookie) {
        const payload = verifySessionToken(sessionCookie);
        currentUserId = payload?.id || null;
      }
    }

    if (!currentUserId) {
      try {
        const defaultUser = await prisma.user.findFirst({ select: { id: true } });
        currentUserId = defaultUser?.id || null;
      } catch {}
    }

    if (!currentUserId) {
      return NextResponse.json({ isFriend: false });
    }

    let resolvedTargetId = targetUserId;
    if (!resolvedTargetId && targetUsername) {
      try {
        const target = await prisma.user.findUnique({
          where: { username: targetUsername },
          select: { id: true },
        });
        resolvedTargetId = target?.id || null;
      } catch {}
    }

    if (!resolvedTargetId) {
      // Pour les pseudos démo
      const demoFriends = ["Hiroshi_89", "Cynthia_F", "SarahChill"];
      if (targetUsername && demoFriends.includes(targetUsername)) {
        return NextResponse.json({ isFriend: true });
      }
      return NextResponse.json({ isFriend: false });
    }

    try {
      const existing = await prisma.friendship.findFirst({
        where: {
          userId: currentUserId,
          friendId: resolvedTargetId,
          status: "ACCEPTED",
        },
      });

      return NextResponse.json({ isFriend: !!existing });
    } catch {
      return NextResponse.json({ isFriend: false });
    }
  } catch (error) {
    return NextResponse.json({ isFriend: false });
  }
}


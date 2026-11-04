import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("lobbygamer_session")?.value;

    if (!sessionCookie) {
      // Si aucun cookie mais qu'il y a un utilisateur par défaut en base, renvoyer l'utilisateur démo
      const defaultUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
          age: true,
          primaryPlatform: true,
          playerType: true,
          reputationScore: true,
          totalReviews: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: defaultUser || null,
        authenticated: false,
      });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({
        success: false,
        user: null,
        authenticated: false,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        bio: true,
        age: true,
        primaryPlatform: true,
        playerType: true,
        reputationScore: true,
        totalReviews: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
        authenticated: false,
      });
    }

    return NextResponse.json({
      success: true,
      user,
      authenticated: true,
    });
  } catch (error) {
    console.error("Erreur GET /api/auth/me:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer la session" },
      { status: 500 }
    );
  }
}

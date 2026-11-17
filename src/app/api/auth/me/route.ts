import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_DEMO_USER = {
  id: "user-valkyrie-demo",
  email: "valkyrie@lobbygamer.local",
  username: "Valkyrie_FR",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  bio: "Spécialiste Apex Legends et Valorant. Micro actif, fair-play garanti !",
  age: 23,
  primaryPlatform: "PC",
  playerType: "COMPETITIVE",
  reputationScore: 98.4,
  totalReviews: 24,
};

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("lobbygamer_session")?.value;

    if (!sessionCookie) {
      let defaultUser: any = null;
      try {
        defaultUser = await prisma.user.findFirst({
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
      } catch {
        // Base hors-ligne, utilisation du profil démo
      }

      return NextResponse.json({
        success: true,
        user: defaultUser || DEFAULT_DEMO_USER,
        authenticated: !!defaultUser,
      });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json({
        success: true,
        user: DEFAULT_DEMO_USER,
        authenticated: false,
      });
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
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
    } catch {
      // Base inaccessible
    }

    return NextResponse.json({
      success: true,
      user: user || { ...DEFAULT_DEMO_USER, id: payload.id, username: payload.username || DEFAULT_DEMO_USER.username },
      authenticated: true,
    });
  } catch (error) {
    console.warn("Mode démo actif pour GET /api/auth/me:", error);
    return NextResponse.json({
      success: true,
      user: DEFAULT_DEMO_USER,
      authenticated: false,
    });
  }
}

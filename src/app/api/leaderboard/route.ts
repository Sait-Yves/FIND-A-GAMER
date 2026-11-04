import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const players = await getLeaderboardData();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      mode: "CSR_API_SOURCE",
      count: players.length,
      serverProcessingMs: duration,
      timestamp: new Date().toISOString(),
      data: players,
    });
  } catch (err) {
    console.error("Erreur API Leaderboard:", err);
    return NextResponse.json(
      { success: false, error: "Erreur récupération classement" },
      { status: 500 }
    );
  }
}


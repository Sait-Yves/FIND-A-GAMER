import { NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Déconnexion réussie",
  });

  // Suppression sécurisée du cookie de session
  response.cookies.set("lobbygamer_session", "", {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}


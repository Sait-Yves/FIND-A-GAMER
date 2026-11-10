import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse email et un mot de passe." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Recherche de l'utilisateur par email
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Si aucun utilisateur en base et qu'il s'agit des comptes de démo par défaut
    if (!user && (cleanEmail === "alex@gamer.fr" || cleanEmail === "valkyrie@lobbygamer.local")) {
      const bcrypt = (await import("bcryptjs")).default;
      const defaultHash = await bcrypt.hash("password123", 10);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          username: cleanEmail === "alex@gamer.fr" ? "AlexVortex" : "Valkyrie_FR",
          passwordHash: defaultHash,
          avatarUrl:
            cleanEmail === "alex@gamer.fr"
              ? "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150"
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          bio: "Joueur passionné sur LobbyGamer. Toujours fair-play avec micro actif !",
          age: 24,
          primaryPlatform: "PC",
          playerType: "COMPETITIVE",
          reputationScore: 98.4,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Aucun compte n'a été trouvé avec cette adresse email." },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Mot de passe incorrect. Veuillez réessayer." },
        { status: 401 }
      );
    }

    // Mise à jour de la dernière activité
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const sessionPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      primaryPlatform: user.primaryPlatform,
      playerType: user.playerType,
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: sessionPayload,
    });

    // Enregistrement du cookie de session sécurisé (HttpOnly, SameSite, Secure)
    response.cookies.set("lobbygamer_session", token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error("Erreur POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}


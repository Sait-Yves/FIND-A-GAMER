import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { Platform, PlayerType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, primaryPlatform = "PC", playerType = "CHILL" } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Pseudo, email et mot de passe sont obligatoires." },
        { status: 400 }
      );
    }

    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: "Le pseudo doit comporter au moins 3 caractères." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit comporter au moins 6 caractères." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Vérifier doublon email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Cette adresse email est déjà utilisée par un autre compte." },
        { status: 409 }
      );
    }

    // Vérifier doublon pseudo
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce pseudo gamer est déjà pris. Veuillez en choisir un autre." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Avatar par défaut gamer moderne
    const defaultAvatar =
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash: hashedPassword,
        avatarUrl: defaultAvatar,
        primaryPlatform: (primaryPlatform as Platform) || "PC",
        playerType: (playerType as PlayerType) || "CHILL",
        bio: "Nouveau membre sur LobbyGamer, prêt à former des escouades !",
        reputationScore: 100.0,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      primaryPlatform: newUser.primaryPlatform,
      playerType: newUser.playerType,
    };

    const token = createSessionToken(sessionPayload);

    const response = NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès",
        user: sessionPayload,
      },
      { status: 201 }
    );

    response.cookies.set("lobbygamer_session", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Erreur POST /api/auth/register:", error);
    return NextResponse.json(
      { error: "Échec de création du compte. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

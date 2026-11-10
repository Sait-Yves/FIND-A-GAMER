import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Utilitaires d'authentification et de sécurité pour LobbyGamer
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const SESSION_SECRET =
  process.env.NEXTAUTH_SECRET || "lobbygamer_production_secure_secret_token_2026";

/**
 * Options sécurisées pour le cookie de session de LobbyGamer
 * Conformes aux recommandations OWASP : HttpOnly, SameSite, Secure
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true, // Protection absolue contre le vol de session via injection XSS
  secure: process.env.NODE_ENV === "production", // Transmis uniquement sur HTTPS en production
  sameSite: "lax" as const, // Protection anti-CSRF sur les formulaires intersites
  path: "/",
  maxAge: 14 * 24 * 60 * 60, // 14 jours en secondes
};

export interface SessionPayload {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  primaryPlatform?: string;
  playerType?: string;
  exp?: number;
}

/**
 * Génère un jeton de session signé cryptographiquement
 */
export function createSessionToken(user: SessionPayload): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      primaryPlatform: user.primaryPlatform,
      playerType: user.playerType,
      exp: Date.now() + 14 * 24 * 3600 * 1000, // 14 jours
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Vérifie l'intégrité d'un jeton de session
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Date.now()) return null;

    return data;
  } catch {
    return null;
  }
}

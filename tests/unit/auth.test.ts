import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  SessionPayload,
} from "@/lib/auth";

describe("Authentification & Sécurité (Unit Tests)", () => {
  it("hache un mot de passe et le vérifie avec succès", async () => {
    const rawPassword = "SuperGamerPassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true); // Signature bcrypt

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword123", hash);
    expect(isInvalid).toBe(false);
  });

  it("génère et valide un jeton de session signé cryptographiquement", () => {
    const userPayload: SessionPayload = {
      id: "user-test-uuid-42",
      email: "alex@gamer.fr",
      username: "AlexVortex",
      primaryPlatform: "PC",
      playerType: "COMPETITIVE",
    };

    const token = createSessionToken(userPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(2); // payload.signature

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(userPayload.id);
    expect(verified?.email).toBe(userPayload.email);
    expect(verified?.username).toBe(userPayload.username);
    expect(verified?.playerType).toBe("COMPETITIVE");
  });

  it("rejette un jeton falsifié ou altéré", () => {
    const userPayload: SessionPayload = {
      id: "user-hacker-1",
      email: "hacker@evil.com",
      username: "EvilPlayer",
    };

    const validToken = createSessionToken(userPayload);
    const [payload, signature] = validToken.split(".");

    // Altérer la signature
    const tamperedToken = `${payload}.${signature}tampered`;
    const result = verifySessionToken(tamperedToken);
    expect(result).toBeNull();

    // Altérer le payload
    const fakePayload = Buffer.from(
      JSON.stringify({ id: "admin-root", username: "admin" })
    ).toString("base64url");
    const forgedToken = `${fakePayload}.${signature}`;
    const forgedResult = verifySessionToken(forgedToken);
    expect(forgedResult).toBeNull();
  });

  it("rejette un jeton expiré", () => {
    const expiredPayload = Buffer.from(
      JSON.stringify({
        id: "user-old-session",
        email: "old@gamer.fr",
        username: "OldGamer",
        exp: Date.now() - 3600 * 1000, // Expiré il y a 1 heure
      })
    ).toString("base64url");

    // Même avec une signature HMAC valide, si exp < Date.now(), il est rejeté
    const crypto = require("crypto");
    const secret =
      process.env.NEXTAUTH_SECRET || "lobbygamer_production_secure_secret_token_2026";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(expiredPayload)
      .digest("base64url");

    const expiredToken = `${expiredPayload}.${signature}`;
    const verified = verifySessionToken(expiredToken);
    expect(verified).toBeNull();
  });
});

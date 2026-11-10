import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { sanitizeText, escapeHtml, sanitizeUsername, isSafeImageUrl } from "@/lib/security/sanitize";
import { validateEnv, maskSecret } from "@/lib/env";
import { SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { middleware } from "@/middleware";

describe("Module Sécurité : XSS, Secrets, CSRF & Headers (Unit Tests)", () => {
  describe("1. Protection Anti-XSS (Sanitization & Encoding)", () => {
    it("supprime les balises script et le code JavaScript malveillant", () => {
      const malicious = "Bonjour <script>alert('XSS')</script>les gamers !";
      const sanitized = sanitizeText(malicious);
      expect(sanitized).toBe("Bonjour les gamers !");
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("alert");
    });

    it("supprime les gestionnaires d'événements inline (onerror, onload, onclick)", () => {
      const payload = `<img src="invalide.jpg" onerror="alert(document.cookie)" /> Salut !`;
      const sanitized = sanitizeText(payload);
      expect(sanitized).not.toContain("onerror");
      expect(sanitized).not.toContain("alert");
      expect(sanitized).toBe("Salut !");
    });

    it("supprime les pseudo-protocoles javascript: et iframe", () => {
      const payload = `<iframe src="javascript:alert(1)"></iframe>Cliquez ici`;
      const sanitized = sanitizeText(payload);
      expect(sanitized).not.toContain("iframe");
      expect(sanitized).not.toContain("javascript");
      expect(sanitized).toBe("Cliquez ici");
    });

    it("encode correctement les entités HTML spéciales avec escapeHtml", () => {
      const raw = `Tom & Jerry <"compétition" '2026'>`;
      const escaped = escapeHtml(raw);
      expect(escaped).toBe("Tom &amp; Jerry &lt;&quot;compétition&quot; &#039;2026&#039;&gt;");
    });

    it("assainit strictement les pseudos avec sanitizeUsername", () => {
      expect(sanitizeUsername("Alex<script>Vortex")).toBe("AlexscriptVortex");
      expect(sanitizeUsername("Sarah Chill 89 !?")).toBe("SarahChill89");
      expect(sanitizeUsername("Valid_User-123")).toBe("Valid_User-123");
    });

    it("valide les URLs d'images sûres", () => {
      expect(isSafeImageUrl("/avatars/avatar-alex.svg")).toBe(true);
      expect(isSafeImageUrl("https://images.unsplash.com/photo-123")).toBe(true);
      expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeImageUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("2. Gestion des Secrets & Variables d'Environnement", () => {
    it("valide la présence des variables d'environnement de base", () => {
      const env = validateEnv();
      expect(env).toBeDefined();
      expect(env.DATABASE_URL).toBeDefined();
      expect(env.NEXTAUTH_SECRET).toBeDefined();
    });

    it("masque correctement les secrets sensibles dans les logs", () => {
      expect(maskSecret("mon_super_secret_production_key_2026")).toMatch(/^mon\.\.\.026$/);
      expect(maskSecret("short")).toBe("***");
      expect(maskSecret("")).toBe("[NON DÉFINI]");
      expect(maskSecret(null)).toBe("[NON DÉFINI]");
    });

    it("garantit que le cookie de session est configuré avec HttpOnly et SameSite", () => {
      expect(SESSION_COOKIE_OPTIONS.httpOnly).toBe(true);
      expect(SESSION_COOKIE_OPTIONS.sameSite).toBe("lax");
      expect(SESSION_COOKIE_OPTIONS.path).toBe("/");
      expect(SESSION_COOKIE_OPTIONS.maxAge).toBeGreaterThan(0);
    });
  });

  describe("3. Protection Anti-CSRF & En-têtes HTTP Sécurisés (Middleware)", () => {
    it("bloque les requêtes mutantes provenant d'une origine externe non autorisée (403)", () => {
      const req = new NextRequest("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          origin: "https://evil-attacker-website.com",
          host: "localhost:3000",
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(403);
    });

    it("autorise les requêtes mutantes légitimes provenant du même domaine", () => {
      const req = new NextRequest("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
      });

      const res = middleware(req);
      expect(res.status).toBe(200);
    });

    it("injecte les en-têtes Content-Security-Policy et anti-clickjacking", () => {
      const req = new NextRequest("http://localhost:3000/");
      const res = middleware(req);

      expect(res.headers.get("Content-Security-Policy")).toBeDefined();
      expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
      expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });
  });
});


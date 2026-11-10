import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware Global de Sécurité :
 * 1. Protection Anti-CSRF (Validation stricte de l'Origin / Referer sur toutes les mutations)
 * 2. En-têtes de Sécurité HTTP & Content Security Policy (CSP)
 */

// Liste des hôtes autorisés pour les requêtes mutantes (CSRF protection)
const ALLOWED_HOST_PATTERNS = [
  /^localhost(:\d+)?$/,
  /^127\.0\.0\.1(:\d+)?$/,
  /^saintyveslaurent-essoneabaghe\.angers\.mds-project\.fr$/,
  /^78\.138\.58\.162(:\d+)?$/,
  /.*\.sslip\.io$/,
];

function isOriginAllowed(originUrl: string, hostHeader?: string | null): boolean {
  try {
    const origin = new URL(originUrl);
    const originHost = origin.host;

    // 1. Même hôte que la requête courante
    if (hostHeader && originHost.toLowerCase() === hostHeader.toLowerCase()) {
      return true;
    }

    // 2. Correspondance avec la liste blanche des motifs autorisés
    return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(originHost));
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const method = req.method.toUpperCase();
  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");

  // =========================================================================
  // 1. PROTECTION ANTI-CSRF (Cross-Site Request Forgery)
  // =========================================================================
  const isMutatingMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  if (isApiRoute && isMutatingMethod) {
    const originHeader = req.headers.get("origin");
    const refererHeader = req.headers.get("referer");
    const hostHeader = req.headers.get("host");

    const sourceOrigin = originHeader || refererHeader;

    // Si une origine est fournie, elle DOIT appartenir aux domaines autorisés
    if (sourceOrigin && !isOriginAllowed(sourceOrigin, hostHeader)) {
      console.warn(`[SÉCURITÉ] Tentative CSRF bloquée depuis l'origine : ${sourceOrigin}`);
      return new NextResponse(
        JSON.stringify({
          error: "Requête non autorisée : violation de la politique de sécurité CSRF (Origin mismatch).",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // =========================================================================
  // 2. EN-TÊTES DE SÉCURITÉ & CONTENT SECURITY POLICY (CSP)
  // =========================================================================
  const res = NextResponse.next();

  // Directives Content Security Policy optimisées
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: data:",
    "connect-src 'self' https://api.rawg.io https://*.rawg.io wss: ws:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", cspDirectives);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=(), browsing-topics=()");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return res;
}

export const config = {
  matcher: [
    /*
     * Appliquer sur toutes les routes sauf fichiers statiques publics (_next/static, favicon, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|fallback-offline.html).*)",
  ],
};


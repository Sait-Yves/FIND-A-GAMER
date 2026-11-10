/**
 * Utilitaires d'assainissement et de protection contre les attaques XSS (Cross-Site Scripting)
 */

/**
 * Encode les caractères HTML dangereux pour empêcher l'interprétation de balises malveillantes
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Nettoie une chaîne de texte libre (ex: bio, message, description de ticket)
 * en supprimant les balises HTML exécutables, scripts, iframes et gestionnaires d'événements JS
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = input;

  // 1. Supprime les blocs complets <script>...</script>, <style>...</style>, <iframe>...</iframe>
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // 2. Supprime les attributs d'événements JavaScript inline (ex: onload=, onerror=, onclick=)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "");

  // 3. Supprime les pseudo-protocoles d'URL dangereux (javascript:, data:text/html, vbscript:)
  cleaned = cleaned.replace(/(javascript|vbscript|data):/gi, "");

  // 4. Supprime les balises HTML restantes pour garantir du texte brut sécurisé
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  return cleaned.trim();
}

/**
 * Valide et nettoie un nom d'utilisateur (pseudo)
 * Autorise uniquement les caractères alphanumériques, underscores et tirets
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== "string") return "";
  // Ne conserve que les caractères alphanumériques, tirets et underscores
  return username.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30);
}

/**
 * Valide si une URL est sûre pour un avatar ou une image (protocoles https/http stricts)
 */
export function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // URL relative locale sûre
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}


import { z } from "zod";

/**
 * Schéma Zod strict pour la validation des variables d'environnement et secrets
 */
const envSchema = z.object({
  // Base de données
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL est requise")
    .default("mysql://root:@localhost:3306/lobbygamer"),

  // Secrets de session et chiffrement (longueur minimale 16 caractères recommandée)
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "Le secret de session doit comporter au moins 16 caractères")
    .default("lobbygamer_default_secure_secret_dev_2026"),

  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL doit être une URL valide")
    .default("http://localhost:3000"),

  // Clés API externes
  RAWG_API_KEY: z.string().optional().default(""),

  // Environnement
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3000),
});

/**
 * Fonction de validation des variables d'environnement
 */
export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ ERREUR DE CONFIGURATION DES VARIABLES D'ENVIRONNEMENT :");
    console.error(parsed.error.format());

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Variables d'environnement critiques invalides en production. Arrêt de sécurité."
      );
    }
  }

  return parsed.success ? parsed.data : envSchema.parse({});
}

// Export singleton des variables d'environnement validées
export const env = validateEnv();

/**
 * Masque un secret sensible pour l'affichage dans les logs ou les diagnostics
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return "[NON DÉFINI]";
  if (secret.length <= 6) return "***";
  return `${secret.slice(0, 3)}...${secret.slice(-3)}`;
}


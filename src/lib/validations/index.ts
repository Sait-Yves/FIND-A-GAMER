import { z } from "zod";

// ----------------------------------------------------
// ENUMS DE VALIDATION
// ----------------------------------------------------

export const PlatformSchema = z.enum([
  "PC",
  "XBOX",
  "PLAYSTATION",
  "SWITCH",
  "MOBILE",
  "CROSSPLAY",
]);

export const PlayerTypeSchema = z.enum([
  "CASUAL",
  "HARDCORE",
  "COMPETITIVE",
  "CHILL",
  "CHATTY",
  "STRATEGIST",
  "ROLEPLAY",
]);

export const ReputationTagSchema = z.enum([
  "FAIR_PLAY",
  "GOOD_COMMUNICATION",
  "TEAM_PLAYER",
  "LEADER",
  "PATIENT",
  "PUNCTUAL",
  "RAGE_QUIT",
  "TOXIC",
  "NO_MIC",
]);

// ----------------------------------------------------
// SCHÉMAS PROFIL UTILISATEUR
// ----------------------------------------------------

export const FavoriteGameInputSchema = z.object({
  rawgGameId: z.number().int().positive(),
  gameTitle: z.string().min(1).max(255),
  gameSlug: z.string().min(1).max(255),
  gameCoverUrl: z.string().url().nullable().optional(),
});

export const UpdateProfileSchema = z.object({
  bio: z.string().max(1000, "La biographie ne peut excéder 1000 caractères").optional().nullable(),
  age: z
    .number()
    .int("L'âge doit être un entier")
    .min(13, "L'âge minimum requis est de 13 ans")
    .max(120, "Âge invalide")
    .optional()
    .nullable(),
  avatarUrl: z.string().url("URL d'avatar invalide").optional().nullable(),
  primaryPlatform: PlatformSchema.default("PC"),
  playerType: PlayerTypeSchema.default("CHILL"),
  favoriteGames: z.array(FavoriteGameInputSchema).max(10, "Vous pouvez choisir jusqu'à 10 jeux favoris").optional(),
});

// ----------------------------------------------------
// SCHÉMAS TICKETS (SALONS LFG)
// ----------------------------------------------------

export const CreateTicketSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit comporter au moins 5 caractères")
    .max(120, "Le titre ne doit pas dépasser 120 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000, "La description est trop longue"),
  rawgGameId: z.number().int().positive("ID de jeu RAWG invalide"),
  gameTitle: z.string().min(1, "Le titre du jeu est requis"),
  gameSlug: z.string().min(1, "Le slug du jeu est requis"),
  gameCoverUrl: z.string().url().nullable().optional(),
  
  // Règles
  is18Plus: z.boolean().default(false),
  micRequired: z.boolean().default(true),
  targetPlatform: PlatformSchema.default("CROSSPLAY"),
  requiredPlayerType: PlayerTypeSchema.optional().nullable(),
  language: z.string().min(2).max(10).default("FR"),
  customRules: z.string().max(1000).optional().nullable(),
  
  // Places & Planification
  maxPlayers: z
    .number()
    .int()
    .min(2, "Le groupe doit accepter au moins 2 joueurs (l'hôte inclus)")
    .max(32, "Maximum 32 joueurs par salon"),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const JoinTicketActionSchema = z.object({
  ticketId: z.string().min(1, "ID du ticket requis"),
});

export const UpdateParticipantStatusSchema = z.object({
  participantId: z.string().min(1),
  status: z.enum(["ACCEPTED", "REJECTED", "KICKED"]),
});

// ----------------------------------------------------
// SCHÉMAS ÉVALUATION (REPUTATION / KARMA)
// ----------------------------------------------------

export const CreateReviewSchema = z.object({
  ticketId: z.string().min(1, "L'ID du ticket est requis"),
  targetUserId: z.string().min(1, "L'ID du joueur évalué est requis"),
  rating: z
    .number()
    .int()
    .min(1, "La note minimale est de 1")
    .max(5, "La note maximale est de 5"),
  comment: z
    .string()
    .max(500, "Le commentaire ne doit pas dépasser 500 caractères")
    .optional()
    .nullable(),
  tags: z.array(ReputationTagSchema).max(5, "Maximum 5 badges sélectionnés").optional(),
});

// ----------------------------------------------------
// SCHÉMAS MESSAGERIE
// ----------------------------------------------------

export const SendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut être vide")
    .max(2000, "Le message est trop long"),
  ticketId: z.string().optional().nullable(),
  conversationId: z.string().optional().nullable(),
}).refine((data) => data.ticketId || data.conversationId, {
  message: "Le message doit être rattaché soit à un ticket, soit à une conversation privée",
});

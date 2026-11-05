import { describe, it, expect } from "vitest";
import {
  CreateTicketSchema,
  CreateReviewSchema,
  UpdateProfileSchema,
  SendMessageSchema,
  PlatformSchema,
} from "@/lib/validations";

describe("Validation Zod - Tickets & Reviews", () => {
  it("valide la création d'un ticket avec des données correctes", () => {
    const validTicket = {
      title: "Recherche Duo Ranked CS2",
      description: "Session de jeu chill ce soir à 21h avec micro",
      rawgGameId: 4200,
      gameTitle: "Portal 2",
      gameSlug: "portal-2",
      maxPlayers: 2,
      is18Plus: false,
      micRequired: true,
      targetPlatform: "PC",
    };

    const result = CreateTicketSchema.safeParse(validTicket);
    expect(result.success).toBe(true);
  });

  it("rejette un ticket dont le nombre max de joueurs est inférieur à 2", () => {
    const invalidTicket = {
      title: "Session Solo", // Titre valide (>= 5 caractères)
      description: "Session de jeu chill ce soir à 21h avec micro", // Description valide (>= 10 caractères)
      rawgGameId: 4200,
      gameTitle: "Portal 2",
      gameSlug: "portal-2",
      maxPlayers: 1, // Doit être >= 2
    };

    const result = CreateTicketSchema.safeParse(invalidTicket);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.issues.map((issue) => issue.path.join("."));
      expect(errorPaths).toContain("maxPlayers");
    }
  });

  it("valide une évaluation de joueur avec badges fair-play", () => {
    const validReview = {
      ticketId: "ticket-123",
      targetUserId: "user-456",
      rating: 5,
      comment: "Excellent coéquipier",
      tags: ["FAIR_PLAY", "GOOD_COMMUNICATION"],
    };

    const result = CreateReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejette une note supérieure à 5 ou inférieure à 1", () => {
    // Note supérieure à 5
    const tooHighReview = {
      ticketId: "ticket-123",
      targetUserId: "user-456",
      rating: 6,
    };
    const resultHigh = CreateReviewSchema.safeParse(tooHighReview);
    expect(resultHigh.success).toBe(false);

    // Note inférieure à 1
    const tooLowReview = {
      ticketId: "ticket-123",
      targetUserId: "user-456",
      rating: 0,
    };
    const resultLow = CreateReviewSchema.safeParse(tooLowReview);
    expect(resultLow.success).toBe(false);
  });

  it("valide la mise à jour de profil utilisateur et les plateformes", () => {
    const validProfile = {
      bio: "Joueur compétitif Valorant & CS2",
      age: 24,
      primaryPlatform: "PC",
      playerType: "COMPETITIVE",
    };
    const result = UpdateProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);

    const invalidAge = {
      age: 10, // Minimum 13 ans
    };
    const resultInvalid = UpdateProfileSchema.safeParse(invalidAge);
    expect(resultInvalid.success).toBe(false);

    expect(PlatformSchema.safeParse("PC").success).toBe(true);
    expect(PlatformSchema.safeParse("GAME_BOY").success).toBe(false);
  });

  it("valide l'envoi d'un message d'escouade", () => {
    const validMsg = {
      content: "Prêt à drop sur Olympus !",
      ticketId: "ticket-42",
    };
    const result = SendMessageSchema.safeParse(validMsg);
    expect(result.success).toBe(true);

    const emptyMsg = {
      content: "",
      ticketId: "ticket-42",
    };
    expect(SendMessageSchema.safeParse(emptyMsg).success).toBe(false);

    const noTargetMsg = {
      content: "Hello monde",
    };
    expect(SendMessageSchema.safeParse(noTargetMsg).success).toBe(false);
  });
});

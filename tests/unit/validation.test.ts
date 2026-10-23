import { describe, it, expect } from "vitest";
import { CreateTicketSchema, CreateReviewSchema } from "@/lib/validations";

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
});

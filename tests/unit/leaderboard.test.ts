import { describe, it, expect } from "vitest";
import { FALLBACK_LEADERBOARD_PLAYERS } from "@/lib/leaderboard";

describe("Classement & Système Fair-Play (Unit Tests)", () => {
  it("fournit une liste de joueurs de démo avec des scores valides", () => {
    expect(FALLBACK_LEADERBOARD_PLAYERS.length).toBeGreaterThanOrEqual(5);

    FALLBACK_LEADERBOARD_PLAYERS.forEach((player, index) => {
      expect(player.rank).toBe(index + 1);
      expect(player.username).toBeDefined();
      expect(player.reputationScore).toBeGreaterThanOrEqual(0);
      expect(player.reputationScore).toBeLessThanOrEqual(100);
      expect(player.badges).toBeInstanceOf(Array);
      expect(player.badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("classe les joueurs par ordre décroissant de réputation karma", () => {
    for (let i = 0; i < FALLBACK_LEADERBOARD_PLAYERS.length - 1; i++) {
      const current = FALLBACK_LEADERBOARD_PLAYERS[i];
      const next = FALLBACK_LEADERBOARD_PLAYERS[i + 1];
      expect(current.reputationScore).toBeGreaterThanOrEqual(next.reputationScore);
    }
  });

  it("attribue des badges de fair-play cohérents avec les critères de réputation", () => {
    // Les scores >= 98% doivent comporter le badge LEADER ou FAIR_PLAY
    const topPlayers = FALLBACK_LEADERBOARD_PLAYERS.filter((p) => p.reputationScore >= 98);
    expect(topPlayers.length).toBeGreaterThan(0);

    topPlayers.forEach((player) => {
      const hasEliteBadge =
        player.badges.includes("FAIR_PLAY") || player.badges.includes("LEADER");
      expect(hasEliteBadge).toBe(true);
    });
  });
});

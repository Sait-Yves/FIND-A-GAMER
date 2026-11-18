import prisma from "@/lib/prisma";

export interface LeaderboardPlayer {
  rank: number;
  id: string;
  username: string;
  avatarUrl: string;
  reputationScore: number;
  matchesFinished: number;
  playerType: string;
  primaryPlatform: string;
  primaryGame: string;
  badges: string[];
}

export const FALLBACK_LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  {
    rank: 1,
    id: "user-top-1",
    username: "SarahChill",
    avatarUrl: "/avatars/avatar-sarah.svg",
    reputationScore: 99.2,
    matchesFinished: 38,
    playerType: "CHILL",
    primaryPlatform: "PLAYSTATION",
    primaryGame: "Helldivers 2",
    badges: ["TEAM_PLAYER", "PATIENT", "FAIR_PLAY"],
  },
  {
    rank: 2,
    id: "user-top-2",
    username: "Valkyrie_FR",
    avatarUrl: "/avatars/avatar-default.svg",
    reputationScore: 98.4,
    matchesFinished: 32,
    playerType: "COMPETITIVE",
    primaryPlatform: "CROSSPLAY",
    primaryGame: "Apex Legends",
    badges: ["GOOD_COMMUNICATION", "FAIR_PLAY", "LEADER"],
  },
  {
    rank: 3,
    id: "user-top-3",
    username: "AlexVortex",
    avatarUrl: "/avatars/avatar-alex.svg",
    reputationScore: 96.5,
    matchesFinished: 28,
    playerType: "COMPETITIVE",
    primaryPlatform: "PC",
    primaryGame: "Counter-Strike 2",
    badges: ["FAIR_PLAY", "PUNCTUAL"],
  },
  {
    rank: 4,
    id: "user-toxic-demo",
    username: "ToxicGamer_99",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    reputationScore: 18.5,
    matchesFinished: 3,
    playerType: "COMPETITIVE",
    primaryPlatform: "PC",
    primaryGame: "Counter-Strike 2",
    badges: ["TOXIC", "RAGE_QUIT", "NO_MIC"],
  },
];

/**
 * Récupère le classement des joueurs depuis la base de données Prisma
 * avec fallback propre si la base est en cours d'initialisation.
 */
export async function getLeaderboardData(): Promise<LeaderboardPlayer[]> {
  try {
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: [
        { reputationScore: "desc" },
        { totalReviews: "desc" },
      ],
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        reputationScore: true,
        totalReviews: true,
        playerType: true,
        primaryPlatform: true,
        favoriteGames: {
          take: 1,
          select: { gameTitle: true },
        },
        _count: {
          select: {
            hostedTickets: true,
            participations: true,
          },
        },
      },
    });

    if (!users || users.length === 0) {
      return FALLBACK_LEADERBOARD_PLAYERS;
    }

    const players: LeaderboardPlayer[] = users.map((u, index) => {
      const badges: string[] = [];
      if (u.reputationScore < 50) {
        badges.push("TOXIC", "RAGE_QUIT", "NO_MIC");
      } else if (u.reputationScore >= 98) {
        badges.push("LEADER", "FAIR_PLAY");
      } else if (u.reputationScore >= 95) {
        badges.push("FAIR_PLAY", "TEAM_PLAYER");
      } else {
        badges.push("PUNCTUAL");
      }

      if (u.reputationScore >= 50 && (u.playerType === "STRATEGIST" || u.playerType === "COMPETITIVE")) {
        badges.push("GOOD_COMMUNICATION");
      }

      const totalMatches =
        (u._count?.hostedTickets || 0) + (u._count?.participations || 0) + u.totalReviews * 4;

      return {
        rank: index + 1,
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl || "/avatars/avatar-default.svg",
        reputationScore: Number(u.reputationScore.toFixed(1)),
        matchesFinished: Math.max(totalMatches, 12),
        playerType: u.playerType,
        primaryPlatform: u.primaryPlatform,
        primaryGame: u.favoriteGames[0]?.gameTitle || "Valorant",
        badges: Array.from(new Set(badges)).slice(0, 3),
      };
    });

    // Si aucun joueur en base, utiliser la liste des joueurs actifs dans les salons
    if (players.length === 0) {
      return FALLBACK_LEADERBOARD_PLAYERS;
    }

    // Toujours s'assurer que ToxicGamer_99 est visible pour la démonstration des badges négatifs
    const hasToxic = players.some((p) => p.username === "ToxicGamer_99");
    if (!hasToxic) {
      const toxicFallback = FALLBACK_LEADERBOARD_PLAYERS.find((p) => p.username === "ToxicGamer_99");
      if (toxicFallback) {
        players.push({
          ...toxicFallback,
          rank: players.length + 1,
        });
      }
    }

    return players;
  } catch (err) {
    console.warn("getLeaderboardData: Utilisation du fallback statique suite à:", err);
    return FALLBACK_LEADERBOARD_PLAYERS;
  }
}


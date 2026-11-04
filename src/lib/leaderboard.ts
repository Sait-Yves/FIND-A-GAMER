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
    username: "Aurelius_Prime",
    avatarUrl: "/avatars/avatar-alex.svg",
    reputationScore: 99.8,
    matchesFinished: 242,
    playerType: "STRATEGIST",
    primaryPlatform: "PC",
    primaryGame: "Valorant",
    badges: ["LEADER", "FAIR_PLAY", "PUNCTUAL"],
  },
  {
    rank: 2,
    id: "user-top-2",
    username: "SarahChill",
    avatarUrl: "/avatars/avatar-sarah.svg",
    reputationScore: 99.2,
    matchesFinished: 189,
    playerType: "CHILL",
    primaryPlatform: "PLAYSTATION",
    primaryGame: "Helldivers 2",
    badges: ["TEAM_PLAYER", "PATIENT", "FAIR_PLAY"],
  },
  {
    rank: 3,
    id: "user-top-3",
    username: "Valkyrie_FR",
    avatarUrl: "/avatars/avatar-default.svg",
    reputationScore: 98.4,
    matchesFinished: 156,
    playerType: "COMPETITIVE",
    primaryPlatform: "CROSSPLAY",
    primaryGame: "Apex Legends",
    badges: ["GOOD_COMMUNICATION", "FAIR_PLAY", "LEADER"],
  },
  {
    rank: 4,
    id: "user-top-4",
    username: "AlexVortex",
    avatarUrl: "/avatars/avatar-alex.svg",
    reputationScore: 96.5,
    matchesFinished: 132,
    playerType: "COMPETITIVE",
    primaryPlatform: "PC",
    primaryGame: "Counter-Strike 2",
    badges: ["FAIR_PLAY", "PUNCTUAL"],
  },
  {
    rank: 5,
    id: "user-top-5",
    username: "Noxis_FPS",
    avatarUrl: "/avatars/avatar-default.svg",
    reputationScore: 95.8,
    matchesFinished: 98,
    playerType: "HARDCORE",
    primaryPlatform: "PC",
    primaryGame: "Warzone 2",
    badges: ["GOOD_COMMUNICATION", "TEAM_PLAYER"],
  },
  {
    rank: 6,
    id: "user-top-6",
    username: "ZenKitsune",
    avatarUrl: "/avatars/avatar-sarah.svg",
    reputationScore: 95.1,
    matchesFinished: 84,
    playerType: "CHILL",
    primaryPlatform: "SWITCH",
    primaryGame: "Rocket League",
    badges: ["PATIENT", "TEAM_PLAYER"],
  },
  {
    rank: 7,
    id: "user-top-7",
    username: "ShadowStriker",
    avatarUrl: "/avatars/avatar-alex.svg",
    reputationScore: 94.7,
    matchesFinished: 79,
    playerType: "STRATEGIST",
    primaryPlatform: "PC",
    primaryGame: "Valorant",
    badges: ["GOOD_COMMUNICATION", "PUNCTUAL"],
  },
  {
    rank: 8,
    id: "user-top-8",
    username: "PixelQueen",
    avatarUrl: "/avatars/avatar-default.svg",
    reputationScore: 94.0,
    matchesFinished: 67,
    playerType: "CHATTY",
    primaryPlatform: "XBOX",
    primaryGame: "Apex Legends",
    badges: ["FAIR_PLAY", "LEADER"],
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
      if (u.reputationScore >= 98) badges.push("LEADER", "FAIR_PLAY");
      else if (u.reputationScore >= 95) badges.push("FAIR_PLAY", "TEAM_PLAYER");
      else badges.push("PUNCTUAL");

      if (u.playerType === "STRATEGIST" || u.playerType === "COMPETITIVE") {
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

    // Compléter avec le roster de démo pour toujours afficher au moins 5 rangs
    if (players.length < 5) {
      const existingUsernames = new Set(players.map((p) => p.username));
      for (const fallback of FALLBACK_LEADERBOARD_PLAYERS) {
        if (!existingUsernames.has(fallback.username)) {
          players.push({
            ...fallback,
            rank: players.length + 1,
          });
        }
      }
    }

    return players;
  } catch (err) {
    console.warn("getLeaderboardData: Utilisation du fallback statique suite à:", err);
    return FALLBACK_LEADERBOARD_PLAYERS;
  }
}


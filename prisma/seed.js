const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du peuplement de la base de données (Seed)...");

  // Nettoyage préalable
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.userFavoriteGame.deleteMany();
  await prisma.user.deleteMany();

  // 1. Création de joueurs fictifs avec profils riches
  const user1 = await prisma.user.create({
    data: {
      email: "alex@gamer.fr",
      username: "AlexVortex",
      passwordHash: "$2a$10$wT8fSgY6oN.G8sQ61nQGheK1Z.8p9R5D6A7sB8cD9eF0gH1iJ2kLm",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150",
      bio: "Joueur compétitif sur Valorant et CS2. Toujours fair-play avec micro actif !",
      age: 24,
      primaryPlatform: "PC",
      playerType: "COMPETITIVE",
      reputationScore: 96.5,
      totalReviews: 12,
      favoriteGames: {
        create: [
          {
            rawgGameId: 415171,
            gameTitle: "Valorant",
            gameSlug: "valorant",
            gameCoverUrl: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
          },
          {
            rawgGameId: 4200,
            gameTitle: "Portal 2",
            gameSlug: "portal-2",
            gameCoverUrl: "https://media.rawg.io/media/games/328/3283613cb7d75d67257fc58339188742.jpg",
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "sarah@gaming.net",
      username: "SarahChill",
      passwordHash: "$2a$10$wT8fSgY6oN.G8sQ61nQGheK1Z.8p9R5D6A7sB8cD9eF0gH1iJ2kLm",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      bio: "Grande passionnée de jeux coopératifs et chill. Pas de prise de tête.",
      age: 21,
      primaryPlatform: "PLAYSTATION",
      playerType: "CHILL",
      reputationScore: 100.0,
      totalReviews: 8,
      favoriteGames: {
        create: [
          {
            rawgGameId: 3498,
            gameTitle: "Grand Theft Auto V",
            gameSlug: "grand-theft-auto-v",
            gameCoverUrl: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
          },
        ],
      },
    },
  });

  // 2. Création d'un Ticket LFG (Groupe de jeu)
  const ticket = await prisma.ticket.create({
    data: {
      title: "Recherche Duo/Trio Ranked Platine - Micro obligatoire",
      description: "On cherche 2 personnes motivées pour grind ce soir. Bonne communication et bonne humeur exigées !",
      hostId: user1.id,
      rawgGameId: 415171,
      gameTitle: "Valorant",
      gameSlug: "valorant",
      gameCoverUrl: "https://media.rawg.io/media/games/054/054e0b57f0b5d564dfc4a523d45e05a3.jpg",
      is18Plus: true,
      micRequired: true,
      targetPlatform: "PC",
      requiredPlayerType: "COMPETITIVE",
      language: "FR",
      customRules: "Pas de flame, callouts précis.",
      maxPlayers: 3,
      currentPlayers: 2,
      status: "OPEN",
    },
  });

  // 3. Inscription de l'hôte et du second joueur
  await prisma.participant.createMany({
    data: [
      {
        ticketId: ticket.id,
        userId: user1.id,
        role: "HOST",
        status: "ACCEPTED",
      },
      {
        ticketId: ticket.id,
        userId: user2.id,
        role: "MEMBER",
        status: "ACCEPTED",
      },
    ],
  });

  // 4. Messages dans le salon du ticket
  await prisma.message.createMany({
    data: [
      {
        ticketId: ticket.id,
        senderId: user1.id,
        content: "Salut Sarah ! Bienvenue dans le groupe. Tu joues quel agent principalement ?",
      },
      {
        ticketId: ticket.id,
        senderId: user2.id,
        content: "Salut Alex ! Je peux jouer Sage ou Fade en support/initiateur sans souci.",
      },
    ],
  });

  // 5. Évaluation comportementale (Review) post-session
  await prisma.review.create({
    data: {
      ticketId: ticket.id,
      reviewerId: user2.id,
      targetUserId: user1.id,
      rating: 5,
      comment: "Super lead d'équipe, très calme et d'excellents callouts !",
      tags: ["FAIR_PLAY", "GOOD_COMMUNICATION", "LEADER"],
    },
  });

  console.log("✅ Seed complété avec succès ! Données de démonstration prêtes.");
}

main()
  .catch((e) => {
    console.error("Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

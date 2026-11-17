const fs = require("fs");
const path = require("path");

function loadEnvFile(file) {
  if (fs.existsSync(file)) {
    fs.readFileSync(file, "utf8").split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}
loadEnvFile(path.join(__dirname, "../.env.local"));
loadEnvFile(path.join(__dirname, "../.env"));

if (!process.env.DATABASE_URL) {
  if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    process.env.DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:3306/${process.env.DB_NAME}`;
  } else {
    process.env.DATABASE_URL = "mysql://root:@localhost:3306/lobbygamer";
  }
}

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

  // 1.3 Joueur exemple avec de très mauvaises notes (Badges négatifs)
  const user3 = await prisma.user.create({
    data: {
      email: "toxic@gamer.fr",
      username: "ToxicGamer_99",
      passwordHash: "$2a$10$wT8fSgY6oN.G8sQ61nQGheK1Z.8p9R5D6A7sB8cD9eF0gH1iJ2kLm",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      bio: "Hardstuck Platine. Marre des noobs qui savent pas jouer. Si vous écoutez pas mes ordres et mes strats, je déco direct de la ranked.",
      age: 19,
      primaryPlatform: "PC",
      playerType: "COMPETITIVE",
      reputationScore: 18.5,
      totalReviews: 3,
      favoriteGames: {
        create: [
          {
            rawgGameId: 4200,
            gameTitle: "Counter-Strike 2",
            gameSlug: "counter-strike-2",
            gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
          },
        ],
      },
    },
  });

  // 2. Création d'un Ticket LFG classique (Valorant)
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

  // 6. Salon de jeu SOLO hébergé par le joueur toxique (Seul dans son salon)
  const soloTicket = await prisma.ticket.create({
    data: {
      title: "[SOLO] CS2 PREMIER TRYHARD — NO NOOBS OR KICK",
      description: "Lobby privé pour monter Global Elite. Je joue seul pour l'instant car tous mes anciens coéquipiers étaient nuls. Micro obligatoire et pas de débutants.",
      hostId: user3.id,
      rawgGameId: 4200,
      gameTitle: "Counter-Strike 2",
      gameSlug: "counter-strike-2",
      gameCoverUrl: "https://media.rawg.io/media/games/736/736190963952e2be29b72bcfa7ce7fa6.jpg",
      is18Plus: true,
      micRequired: true,
      targetPlatform: "PC",
      requiredPlayerType: "COMPETITIVE",
      language: "FR",
      customRules: "Exécution immédiate des ordres ou kick",
      maxPlayers: 5,
      currentPlayers: 1, // Seul dans son salon !
      status: "OPEN",
    },
  });

  // 7. Inscription de ToxicGamer_99 seul dans son salon
  await prisma.participant.create({
    data: {
      ticketId: soloTicket.id,
      userId: user3.id,
      role: "HOST",
      status: "ACCEPTED",
    },
  });

  // 8. Évaluations négatives de comportement reçues par ToxicGamer_99 (Badges négatifs)
  await prisma.review.create({
    data: {
      ticketId: soloTicket.id,
      reviewerId: user1.id,
      targetUserId: user3.id,
      rating: 1,
      comment: "Insulte ses coéquipiers dès le round 2, refuse d'écouter les callouts et rage quit dès sa première mort en pleine ranked !",
      tags: ["RAGE_QUIT", "TOXIC"],
    },
  });

  await prisma.review.create({
    data: {
      ticketId: ticket.id,
      reviewerId: user2.id,
      targetUserId: user3.id,
      rating: 1,
      comment: "Micro coupé tout le match puis hurle en vocal quand il meurt en solo. Attitude toxique et aucun esprit d'équipe.",
      tags: ["TOXIC", "NO_MIC", "RAGE_QUIT"],
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

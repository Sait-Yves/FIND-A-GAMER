/**
 * In-memory Store pour les salons de démonstration (mode démo / hors-ligne).
 * Permet de rejoindre, quitter et envoyer des messages dans les salons démo
 * comme le salon solo de ToxicGamer_99.
 */

export interface DemoParticipant {
  id: string;
  userId: string;
  role: "HOST" | "MEMBER";
  status: "ACCEPTED" | "LEFT";
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    playerType: string;
    primaryPlatform: string;
    reputationScore: number;
  };
}

export interface DemoMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string;
    playerType: string;
  };
}

export interface DemoTicket {
  id: string;
  title: string;
  description: string;
  gameTitle: string;
  gameSlug: string;
  rawgGameId: number;
  gameCoverUrl: string;
  maxPlayers: number;
  currentPlayers: number;
  micRequired: boolean;
  is18Plus: boolean;
  targetPlatform: string;
  requiredPlayerType: string;
  customRules?: string;
  language: string;
  status: "OPEN" | "FULL" | "CANCELLED";
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
  host: {
    id: string;
    username: string;
    avatarUrl: string;
    reputationScore: number;
    totalReviews: number;
    primaryPlatform: string;
    playerType: string;
  };
  participants: DemoParticipant[];
  messages: DemoMessage[];
}

// Initialisation globale pour persister entre les requêtes en environnement Node.js / Next.js
declare global {
  // eslint-disable-next-line no-var
  var __demoTicketsStore: Map<string, DemoTicket> | undefined;
}

function getStore(): Map<string, DemoTicket> {
  if (!global.__demoTicketsStore) {
    global.__demoTicketsStore = new Map<string, DemoTicket>();

    // Initialisation du salon solo de ToxicGamer_99
    const toxicHost = {
      id: "user-toxic-demo",
      username: "ToxicGamer_99",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      reputationScore: 18.5,
      totalReviews: 3,
      primaryPlatform: "PC",
      playerType: "COMPETITIVE",
    };

    const toxicTicket: DemoTicket = {
      id: "demo-ticket-toxic-cs2",
      title: "[SOLO] CS2 PREMIER TRYHARD — NO NOOBS OR KICK",
      description:
        "Lobby privé pour monter Global Elite. Je joue seul pour l'instant car tous mes anciens coéquipiers étaient nuls. Micro obligatoire et pas de débutants.",
      gameTitle: "Counter-Strike 2",
      gameSlug: "counter-strike-2",
      rawgGameId: 4200,
      gameCoverUrl:
        "/games/counter-strike-2.svg",
      maxPlayers: 5,
      currentPlayers: 1, // Hôte seul au départ
      micRequired: true,
      is18Plus: true,
      targetPlatform: "PC",
      requiredPlayerType: "COMPETITIVE",
      customRules: "Exécution immédiate des ordres ou kick",
      language: "FR",
      status: "OPEN",
      hostId: toxicHost.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      host: toxicHost,
      participants: [
        {
          id: "part-toxic-host",
          userId: toxicHost.id,
          role: "HOST",
          status: "ACCEPTED",
          joinedAt: new Date(),
          user: toxicHost,
        },
      ],
      messages: [
        {
          id: "msg-toxic-1",
          ticketId: "demo-ticket-toxic-cs2",
          senderId: toxicHost.id,
          content:
            "Bienvenue dans le salon. Si vous loupez vos smokes sur Mirage ou Inferno c'est un kick immédiat.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            id: toxicHost.id,
            username: toxicHost.username,
            avatarUrl: toxicHost.avatarUrl,
            playerType: toxicHost.playerType,
          },
        },
      ],
    };

    global.__demoTicketsStore.set("demo-ticket-toxic-cs2", toxicTicket);
  }

  return global.__demoTicketsStore;
}

export function getDemoTicket(id: string): DemoTicket | null {
  const store = getStore();
  if (store.has(id)) {
    return store.get(id)!;
  }

  // Si l'id contient toxic ou cs2
  if (id.toLowerCase().includes("toxic") || id.toLowerCase().includes("cs2")) {
    return store.get("demo-ticket-toxic-cs2") || null;
  }

  return null;
}

export function joinDemoTicket(
  ticketId: string,
  user: {
    id: string;
    username?: string;
    avatarUrl?: string;
    playerType?: string;
    primaryPlatform?: string;
    reputationScore?: number;
  }
): { success: boolean; error?: string; alreadyInRoom?: boolean; isHost?: boolean; ticket?: DemoTicket } {
  const ticket = getDemoTicket(ticketId);
  if (!ticket) {
    return { success: false, error: "Salon démo introuvable" };
  }

  // Est-il l'hôte ?
  if (ticket.hostId === user.id) {
    return { success: true, isHost: true, alreadyInRoom: true, ticket };
  }

  // Est-il déjà participant actif ?
  const existingPart = ticket.participants.find(
    (p) => p.userId === user.id && p.status === "ACCEPTED"
  );
  if (existingPart) {
    return { success: true, alreadyInRoom: true, ticket };
  }

  // Vérifier capacité
  const activeParticipants = ticket.participants.filter((p) => p.status === "ACCEPTED");
  if (activeParticipants.length >= ticket.maxPlayers) {
    return { success: false, error: "Ce salon est déjà complet" };
  }

  // Ajouter le participant
  const newParticipant: DemoParticipant = {
    id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: user.id,
    role: "MEMBER",
    status: "ACCEPTED",
    joinedAt: new Date(),
    user: {
      id: user.id,
      username: user.username || "Vous",
      avatarUrl: user.avatarUrl || "/avatars/avatar-default.svg",
      playerType: user.playerType || "CHILL",
      primaryPlatform: user.primaryPlatform || "PC",
      reputationScore: user.reputationScore ?? 99.0,
    },
  };

  // Réactiver un ancien participant ou ajouter un nouveau
  const prevIdx = ticket.participants.findIndex((p) => p.userId === user.id);
  if (prevIdx !== -1) {
    ticket.participants[prevIdx] = newParticipant;
  } else {
    ticket.participants.push(newParticipant);
  }

  ticket.currentPlayers = ticket.participants.filter((p) => p.status === "ACCEPTED").length;
  if (ticket.currentPlayers >= ticket.maxPlayers) {
    ticket.status = "FULL";
  }

  // Message de bienvenue automatique
  ticket.messages.push({
    id: `msg-${Date.now()}`,
    ticketId: ticket.id,
    senderId: user.id,
    content: `Salut l'escouade ! @${newParticipant.user.username} a rejoint le salon.`,
    createdAt: new Date().toISOString(),
    sender: {
      id: user.id,
      username: newParticipant.user.username,
      avatarUrl: newParticipant.user.avatarUrl,
      playerType: newParticipant.user.playerType,
    },
  });

  return { success: true, ticket };
}

export function leaveDemoTicket(
  ticketId: string,
  userId: string
): { success: boolean; error?: string; ticket?: DemoTicket } {
  const ticket = getDemoTicket(ticketId);
  if (!ticket) {
    return { success: false, error: "Salon démo introuvable" };
  }

  if (ticket.hostId === userId) {
    ticket.status = "CANCELLED";
    ticket.participants.forEach((p) => (p.status = "LEFT"));
    ticket.currentPlayers = 0;
    return { success: true, ticket };
  }

  const part = ticket.participants.find((p) => p.userId === userId && p.status === "ACCEPTED");
  if (part) {
    part.status = "LEFT";
    ticket.currentPlayers = Math.max(1, ticket.participants.filter((p) => p.status === "ACCEPTED").length);
    ticket.status = "OPEN";

    ticket.messages.push({
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderId: userId,
      content: `@${part.user.username} a quitté le salon.`,
      createdAt: new Date().toISOString(),
      sender: {
        id: userId,
        username: part.user.username,
        avatarUrl: part.user.avatarUrl,
        playerType: part.user.playerType,
      },
    });
  }

  return { success: true, ticket };
}

export function addDemoMessage(
  ticketId: string,
  sender: { id: string; username?: string; avatarUrl?: string; playerType?: string },
  content: string
): DemoMessage | null {
  const ticket = getDemoTicket(ticketId);
  if (!ticket) return null;

  const msg: DemoMessage = {
    id: `msg-${Date.now()}`,
    ticketId: ticket.id,
    senderId: sender.id,
    content,
    createdAt: new Date().toISOString(),
    sender: {
      id: sender.id,
      username: sender.username || "Vous",
      avatarUrl: sender.avatarUrl || "/avatars/avatar-default.svg",
      playerType: sender.playerType || "CHILL",
    },
  };

  ticket.messages.push(msg);
  return msg;
}

export function getDemoMessages(ticketId: string): DemoMessage[] {
  const ticket = getDemoTicket(ticketId);
  return ticket ? ticket.messages : [];
}


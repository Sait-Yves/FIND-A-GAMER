import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma } = vi.hoisted(() => {
  const m: any = {
    ticket: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    participant: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  m.$transaction.mockImplementation(async (fn: any) => {
    if (typeof fn === "function") {
      return fn(m);
    }
    return fn;
  });
  return { mockPrisma: m };
});

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

import { POST as joinRoom } from "@/app/api/tickets/[id]/join/route";
import { POST as leaveRoom } from "@/app/api/tickets/[id]/leave/route";

describe("API Salons & Contraintes Matchmaking (Functional Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie une erreur 404 si le ticket cible n'existe pas", async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-test-1" });

    const req = new NextRequest("http://localhost:3000/api/tickets/non-existent/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-test-1" }),
    });

    const res = await joinRoom(req, {
      params: Promise.resolve({ id: "non-existent" }),
    });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Ticket introuvable");
  });

  it("reconnaît l'hôte du salon lorsqu'il tente de rejoindre son propre salon", async () => {
    const hostUser = { id: "host-123", username: "AlexVortex" };
    const ticket = {
      id: "ticket-42",
      hostId: "host-123",
      currentPlayers: 1,
      maxPlayers: 3,
      participants: [],
    };

    mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
    mockPrisma.user.findUnique.mockResolvedValue(hostUser);

    const req = new NextRequest("http://localhost:3000/api/tickets/ticket-42/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "host-123" }),
    });

    const res = await joinRoom(req, {
      params: Promise.resolve({ id: "ticket-42" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.isHost).toBe(true);
    expect(json.alreadyInRoom).toBe(true);
  });

  it("bloque l'utilisateur avec une erreur 409 s'il est déjà actif dans un AUTRE salon", async () => {
    const candidate = { id: "player-99", username: "PlayerOne" };
    const targetTicket = {
      id: "ticket-target",
      hostId: "other-host",
      currentPlayers: 1,
      maxPlayers: 3,
      participants: [],
    };

    mockPrisma.ticket.findUnique.mockResolvedValue(targetTicket);
    mockPrisma.user.findUnique.mockResolvedValue(candidate);

    // L'utilisateur participe activement à un autre ticket
    mockPrisma.participant.findFirst.mockResolvedValue({
      id: "part-active",
      ticket: {
        id: "other-ticket-active",
        title: "Autre Salon LFG",
        gameTitle: "Valorant",
      },
    });

    const req = new NextRequest("http://localhost:3000/api/tickets/ticket-target/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "player-99" }),
    });

    const res = await joinRoom(req, {
      params: Promise.resolve({ id: "ticket-target" }),
    });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.activeTicketId).toBe("other-ticket-active");
    expect(json.error).toContain("déjà à un salon actif");
  });

  it("bloque la tentative si le salon est complet (capacité atteinte)", async () => {
    const candidate = { id: "player-100", username: "LatePlayer" };
    const fullTicket = {
      id: "ticket-full",
      hostId: "host-001",
      currentPlayers: 3,
      maxPlayers: 3, // Complet
      participants: [],
    };

    mockPrisma.ticket.findUnique.mockResolvedValue(fullTicket);
    mockPrisma.user.findUnique.mockResolvedValue(candidate);
    mockPrisma.participant.findFirst.mockResolvedValue(null);
    mockPrisma.ticket.findFirst.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/tickets/ticket-full/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "player-100" }),
    });

    const res = await joinRoom(req, {
      params: Promise.resolve({ id: "ticket-full" }),
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Ce salon est complet");
  });

  it("permet à un joueur de quitter un salon et libère la place", async () => {
    const member = { id: "player-leave-1" };
    const ticket = {
      id: "ticket-leave",
      hostId: "host-boss",
      currentPlayers: 2,
    };

    mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
    mockPrisma.user.findUnique.mockResolvedValue(member);
    mockPrisma.participant.findUnique.mockResolvedValue({
      id: "part-123",
      status: "ACCEPTED",
    });
    mockPrisma.participant.update.mockResolvedValue({ id: "part-123", status: "LEFT" });
    mockPrisma.ticket.update.mockResolvedValue({ ...ticket, currentPlayers: 1 });

    const req = new NextRequest("http://localhost:3000/api/tickets/ticket-leave/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "player-leave-1" }),
    });

    const res = await leaveRoom(req, {
      params: Promise.resolve({ id: "ticket-leave" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockPrisma.participant.update).toHaveBeenCalled();
  });
});

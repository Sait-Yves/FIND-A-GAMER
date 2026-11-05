import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    friendship: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

import { GET, POST, DELETE } from "@/app/api/friends/route";

describe("API Amis / Friends (Functional Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/friends renvoie la liste des amis de l'utilisateur", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-current-1" });
    mockPrisma.friendship.findMany.mockResolvedValue([
      {
        id: "rel-1",
        friend: {
          id: "friend-1",
          username: "SarahChill",
          avatarUrl: "/avatars/avatar-sarah.svg",
          primaryPlatform: "PLAYSTATION",
          playerType: "CHILL",
          reputationScore: 100,
          favoriteGames: [{ gameTitle: "Apex Legends" }],
        },
      },
    ]);

    const req = new NextRequest("http://localhost:3000/api/friends");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.friends)).toBe(true);
    expect(json.friends.length).toBeGreaterThan(0);
    expect(json.friends[0].username).toBe("SarahChill");
  });

  it("POST /api/friends rejette les requêtes sans identifiant ni pseudo avec un code 400", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-current-1" });

    const req = new NextRequest("http://localhost:3000/api/friends", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/requis/i);
  });

  it("POST /api/friends empêche d'ajouter son propre compte en ami (400)", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-self" });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-self",
      username: "AlexVortex",
      avatarUrl: "/avatars/avatar-alex.svg",
    });

    const req = new NextRequest("http://localhost:3000/api/friends", {
      method: "POST",
      body: JSON.stringify({ username: "AlexVortex" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/vous-même/i);
  });

  it("POST /api/friends permet d'ajouter un nouvel ami avec succès", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-self" });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-friend-2",
      username: "Noxis_FPS",
      avatarUrl: "/avatars/avatar-default.svg",
    });
    mockPrisma.friendship.upsert.mockResolvedValue({ id: "fs-1" });

    const req = new NextRequest("http://localhost:3000/api/friends", {
      method: "POST",
      body: JSON.stringify({ username: "Noxis_FPS" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.friend.username).toBe("Noxis_FPS");
  });

  it("DELETE /api/friends permet de retirer un ami avec succès", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: "user-self" });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-friend-2",
      username: "Noxis_FPS",
    });
    mockPrisma.friendship.deleteMany.mockResolvedValue({ count: 1 });

    const req = new NextRequest("http://localhost:3000/api/friends", {
      method: "DELETE",
      body: JSON.stringify({ username: "Noxis_FPS" }),
    });
    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.removedUsername).toBe("Noxis_FPS");
  });
});


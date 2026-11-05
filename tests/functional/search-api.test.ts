import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findMany: vi.fn(),
    },
    ticket: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

import { GET } from "@/app/api/search/route";

describe("API Recherche Globale (Functional Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie des listes vides sans erreur quand le paramètre de recherche est vide", async () => {
    const req = new NextRequest("http://localhost:3000/api/search?q=");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.users).toEqual([]);
    expect(json.tickets).toEqual([]);
  });

  it("renvoie des résultats cohérents quand une requête textuelle est fournie", async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: "user-alex-1",
        username: "AlexVortex",
        avatarUrl: "/avatars/avatar-alex.svg",
        playerType: "COMPETITIVE",
        primaryPlatform: "PC",
        reputationScore: 96.5,
        totalReviews: 12,
      },
    ]);
    mockPrisma.ticket.findMany.mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/api/search?q=Alex");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.query).toBe("Alex");
    expect(Array.isArray(json.users)).toBe(true);
    expect(json.users.length).toBe(1);
    expect(json.users[0].username).toBe("AlexVortex");
  });

  it("échappe sans planter les caractères spéciaux SQL / regex (% et _)", async () => {
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.ticket.findMany.mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/api/search?q=%25_test%25");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.users)).toBe(true);
    expect(Array.isArray(json.tickets)).toBe(true);
  });
});

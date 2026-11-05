import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    message: {
      deleteMany: vi.fn(),
    },
    conversationMember: {
      deleteMany: vi.fn(),
    },
    conversation: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
}));

import { DELETE } from "@/app/api/conversations/[id]/route";

describe("API Conversations - Suppression (Functional Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DELETE /api/conversations/[id] supprime les messages, membres et la conversation", async () => {
    mockPrisma.message.deleteMany.mockResolvedValue({ count: 5 });
    mockPrisma.conversationMember.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.conversation.deleteMany.mockResolvedValue({ count: 1 });

    const req = new NextRequest("http://localhost:3000/api/conversations/conv-123", {
      method: "DELETE",
    });

    const routeParams = {
      params: Promise.resolve({ id: "conv-123" }),
    };

    const res = await DELETE(req, routeParams);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.deletedId).toBe("conv-123");
    expect(mockPrisma.message.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: "conv-123" },
    });
    expect(mockPrisma.conversation.deleteMany).toHaveBeenCalledWith({
      where: { id: "conv-123" },
    });
  });
});


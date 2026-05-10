import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "email",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("products.reviews", () => {
  it("fetches reviews for a product (public)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // product 1 should exist from seed data
    const result = await caller.products.reviews({ productId: 1 });

    expect(result).toHaveProperty("reviews");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("avgRating");
    expect(result).toHaveProperty("distribution");
    expect(Array.isArray(result.reviews)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.avgRating).toBe("number");
  });

  it("fetches product images (public)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const images = await caller.products.images({ productId: 1 });

    expect(Array.isArray(images)).toBe(true);
  });

  it("fetches related products (public)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const related = await caller.products.related({ productId: 1, category: "salads" });

    expect(Array.isArray(related)).toBe(true);
    // Related products should not include the original product
    const ids = related.map((p) => p.id);
    expect(ids).not.toContain(1);
  });

  it("addReview requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.addReview({ productId: 1, rating: 5, comment: "Great!" })
    ).rejects.toThrow();
  });

  it("addReview validates rating range (1-5)", async () => {
    const { ctx } = createAuthContext(99);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.addReview({ productId: 1, rating: 6 })
    ).rejects.toThrow();

    await expect(
      caller.products.addReview({ productId: 1, rating: 0 })
    ).rejects.toThrow();
  });
});

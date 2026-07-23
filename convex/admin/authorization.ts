import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireAdmin(context: QueryCtx | MutationCtx) {
  const authUserId = await getAuthUserId(context);
  if (!authUserId) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Please sign in to access the admin dashboard.",
    });
  }

  const admin = await context.db
    .query("adminUsers")
    .withIndex("by_auth_user", (queryBuilder) =>
      queryBuilder.eq("authUserId", authUserId),
    )
    .unique();

  if (!admin) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Your account is not authorized to manage this event.",
    });
  }

  return { admin, authUserId };
}

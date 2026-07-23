import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const get = query({
  args: {},
  handler: async (context) => {
    const authUserId = await getAuthUserId(context);
    if (!authUserId) return { signedIn: false, role: null };

    const admin = await context.db
      .query("adminUsers")
      .withIndex("by_auth_user", (queryBuilder) =>
        queryBuilder.eq("authUserId", authUserId),
      )
      .unique();

    return {
      signedIn: true,
      role: admin?.role ?? null,
    };
  },
});

export const bootstrap = mutation({
  args: { bootstrapCode: v.string() },
  handler: async (context, { bootstrapCode }) => {
    const authUserId = await getAuthUserId(context);
    if (!authUserId) {
      throw new ConvexError("Please sign in before activating admin access.");
    }

    const configuredCode = process.env.ADMIN_BOOTSTRAP_CODE;
    if (!configuredCode || bootstrapCode !== configuredCode) {
      throw new ConvexError("The admin activation code is invalid.");
    }

    const existingAdmin = await context.db.query("adminUsers").first();
    if (existingAdmin) {
      throw new ConvexError(
        "An administrator already exists. Ask them to grant access.",
      );
    }

    await context.db.insert("adminUsers", {
      authUserId,
      role: "admin",
    });

    return { activated: true };
  },
});

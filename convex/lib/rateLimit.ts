import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";

export async function enforceRateLimit(
  context: MutationCtx,
  key: string,
  options: { attempts: number; windowMs: number },
) {
  const now = Date.now();
  const record = await context.db
    .query("rateLimits")
    .withIndex("by_key", (queryBuilder) => queryBuilder.eq("key", key))
    .unique();

  if (!record || now - record.windowStartedAt >= options.windowMs) {
    if (record) {
      await context.db.patch(record._id, {
        attempts: 1,
        windowStartedAt: now,
      });
    } else {
      await context.db.insert("rateLimits", {
        key,
        attempts: 1,
        windowStartedAt: now,
      });
    }
    return;
  }

  if (record.attempts >= options.attempts) {
    throw new ConvexError({
      code: "RATE_LIMITED",
      message: "Too many attempts. Please wait a few minutes and try again.",
    });
  }

  await context.db.patch(record._id, { attempts: record.attempts + 1 });
}

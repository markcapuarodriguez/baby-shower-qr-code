import { query } from "./_generated/server";

export const getPublic = query({
  args: {},
  handler: async (context) => {
    return await context.db.query("eventSettings").first();
  },
});

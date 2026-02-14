import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspace: defineTable({
    userId: v.optional(v.string()),
    messages: v.any(),
    fileData: v.optional(v.any()),
  }),
});

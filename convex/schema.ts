// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Keep the standard auth tables as they are.
  ...authTables,

  // **Correction**: Create a separate table for your app-specific user data.
  // This table has a one-to-one relationship with the `users` table.
  userProfiles: defineTable({
    // This is the link back to the main `users` table.
    userId: v.id("users"),
    points: v.number(),
    level: v.number(),
    unlockedBadges: v.array(v.string()),
  })
    // Create indexes for your new table.
    .index("by_userId", ["userId"])
    .index("by_points", ["points"]),

  // The 'questions' table remains the same.
  questions: defineTable({
    questionId: v.string(),
    subject: v.string(),
    courseCodes: v.array(v.string()),
    gradeLevel: v.string(),
    line: v.string(),
    category: v.string(),
    topic: v.string(),
    difficulty: v.number(),
    suitableForOralPractice: v.boolean(),
    questionText: v.string(),
    options: v.array(v.object({ text: v.string(), isCorrect: v.boolean() })),
    explanation: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_topic", ["topic"]),

  // The 'quizAttempts' table also remains the same.
  quizAttempts: defineTable({
    // This reference is now to your custom profile table.
    userProfileId: v.id("userProfiles"),
    category: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
  }).index("by_userProfileId", ["userProfileId"]),
});
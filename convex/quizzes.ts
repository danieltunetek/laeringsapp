// convex/quizzes.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// getQuiz implementation is correct and remains unchanged.
export const getQuiz = query({
  args: { category: v.string(), numQuestions: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const numQuestions = args.numQuestions ?? 10;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
  },
});


export const submitQuizResults = mutation({
  args: {
    category: v.string(),
    answers: v.array(v.object({ questionId: v.id("questions"), selectedOption: v.string() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in.");
    }
    
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", q => q.eq("userId", identity.subject as Id<"users">))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }
    
    const questionIds = args.answers.map(a => a.questionId);
    const correctAnswers = await Promise.all(
        questionIds.map(id => ctx.db.get(id))
    );

    let score = 0;
    for (const userAnswer of args.answers) {
        // **Correction**: Compare Id objects directly with '==='. The .equals() method does not exist.
        const question = correctAnswers.find(q => q?._id === userAnswer.questionId);
        const correctOption = question?.options.find(o => o.isCorrect);
        if (userAnswer.selectedOption === correctOption?.text) {
            score++;
        }
    }
    
    await ctx.db.patch(userProfile._id, { points: userProfile.points + score });

    await ctx.db.insert("quizAttempts", {
      userProfileId: userProfile._id,
      category: args.category,
      score: score,
      totalQuestions: args.answers.length,
    });
    
    return { score };
  },
});
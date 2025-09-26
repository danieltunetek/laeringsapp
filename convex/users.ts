// convex/users.ts
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

// Internal: create user profile if missing.
export const createUserProfile = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Id<"userProfiles">> => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      points: 0,
      level: 1,
      unlockedBadges: [],
    });
  },
});

// Public: ensure the current authed user has a profile.
export const ensureUserProfile = mutation({
  handler: async (ctx): Promise<Id<"userProfiles">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // identity.subject is a string; convert to Id<"users">
    const userId = ctx.db.normalizeId("users", identity.subject);
    if (!userId) throw new Error("Invalid user id");

    const profileId = await ctx.runMutation(internal.users.createUserProfile, {
      userId,
    });
    return profileId;
  },
});

// Get current user's auth doc + custom profile.
export const getUserProfile = query({
  handler: async (
    ctx
  ): Promise<{ user: Doc<"users">; profile: Doc<"userProfiles"> | null } | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = ctx.db.normalizeId("users", identity.subject);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .unique();

    return { user, profile };
  },
});

// Top 20 by points with user name lookup.
export const getLeaderboard = query({
  handler: async (
    ctx
  ): Promise<{ name: string | undefined; points: number }[]> => {
    const profiles: Doc<"userProfiles">[] = await ctx.db
      .query("userProfiles")
      .withIndex("by_points")
      .order("desc")
      .take(20); // no .collect() after take

    return Promise.all(
      profiles.map(async (p: Doc<"userProfiles">) => {
        const user = await ctx.db.get(p.userId); // typed as Doc<"users"> | null
        return {
          name: user?.name, // 'name' is optional on users
          points: p.points,
        };
      })
    );
  },
});
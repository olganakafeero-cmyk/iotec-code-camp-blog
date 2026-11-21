import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  blogCategoryValidator,
  blogStatusValidator,
  subscriptionModeValidator,
} from "./schema";


// Step 1 of an upload: Convex gives the browser a one-time link to send the file to.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    subtitle: v.string(),
    excerpt: v.string(),
    previewContentHtml: v.string(),
    fullContentHtml: v.string(),
    category: blogCategoryValidator,
    tags: v.optional(v.array(v.string())),
    readTime: v.string(),
    wordCount: v.number(),
    status: blogStatusValidator,
    subscriptionMode: subscriptionModeValidator,
    price: v.object({
      amount: v.number(),
      currency: v.string(),
    }),
    coverImageStorageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    coverImageData: v.object({
      alt: v.string(),
      caption: v.string(),
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      dimensions: v.optional(v.string()),
    }),
    author: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        role: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Make the slug unique: my-blog, my-blog-2, my-blog-3 ...
    let slug = args.slug;
    let counter = 1;
    while (
      await ctx.db
        .query("blogs")
        .filter((q) => q.eq(q.field("slug"), slug))
        .first()
    ) {
      counter += 1;
      slug = `${args.slug}-${counter}`;
    }

    // If a picture was uploaded, ask Convex for its public link.
    const coverImageUrl = args.coverImageStorageId
      ? ((await ctx.storage.getUrl(args.coverImageStorageId)) ?? undefined)
      : args.coverImageUrl;

    return await ctx.db.insert("blogs", {
      ...args,
      slug,
      coverImageUrl,
      updatedAt: Date.now(),
    });
  },
});
export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("blogs").order("desc").collect(),
});
export const listPublished = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("blogs")
      .order("desc")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect(),
});


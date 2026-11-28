import { env, mutation, query } from "./_generated/server";
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
        .withIndex("by_slug", (q) => q.eq("slug", slug))
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

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const blog = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!blog || blog.status !== "published") return null;
    return {
      ...blog,
      fullContentHtml: blog.subscriptionMode === "free" ? blog.fullContentHtml : "",
    };
  },
});

// Only returns the full article if this reader has a completed payment for this blog.
export const getPaidContent = query({
  args: { blogId: v.id("blogs"), transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (
      !transaction ||
      transaction.blogId !== args.blogId ||
      transaction.transactionType !== "subscription" ||
      transaction.status !== "completed"
    ) {
      return null;
    }
    const blog = await ctx.db.get(args.blogId);
    return blog && blog.status === "published" ? blog.fullContentHtml : null;
  },
});

// Lets the page show the right currency (ITX while testing, UGX when live).
export const paymentCurrency = query({
  args: {},
  handler: async () =>env.IOTEC_PAY_CURRENCY ?? null,
});
// For the admin portal: returns any blog, drafts included, with its full text.
export const getForAdmin = query({
  args: { slug: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first(),
});
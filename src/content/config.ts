import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.union([
      z.array(z.string()),
      z.string().transform((val) => [val]),
    ]).nullable().optional(),
    category: z.string().optional(),
    blueskyUrl: z.string().optional(),
    blueskyUri: z.string().optional(),
  }),
});

export const collections = { posts };

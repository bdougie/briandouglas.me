import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
// Shared satori/sharp renderer, also used by tests and the og-bench script
import { generateOGImage } from '../../../scripts/lib/og-generator.mjs';

export const getStaticPaths = (async () => {
  const posts = await getCollection('posts');
  const published = posts.filter((post) => !post.data.draft);

  return [
    // Default card for the home page and any non-post page
    {
      params: { slug: 'default' },
      props: { title: 'bdougie on the internet' },
    },
    ...published.map((post) => ({
      // Matches the last path segment of post URLs: /posts/YYYY/MM/DD/<slug>/
      params: { slug: post.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '') },
      props: { title: post.data.title },
    })),
  ];
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = await generateOGImage({ title: props.title });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};

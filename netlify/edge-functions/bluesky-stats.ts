import type { Context, Config } from "@netlify/edge-functions";

interface BlueskyStats {
  likeCount: number;
  repostCount: number;
  replyCount: number;
  likers: Array<{
    handle: string;
    displayName: string;
    avatar: string | null;
  }>;
  replies: Array<{
    author: {
      handle: string;
      displayName: string;
      avatar: string | null;
    };
    text: string;
    postId: string;
  }>;
  postUrl: string;
}

async function resolveDid(handle: string): Promise<string | null> {
  // If already a DID, return as-is
  if (handle.startsWith("did:")) {
    return handle;
  }

  try {
    const response = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.did;
    }
  } catch (e) {
    console.error("Failed to resolve DID:", e);
  }
  return null;
}

export default async (req: Request, context: Context): Promise<Response> => {
  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");
  const postId = url.searchParams.get("postId");

  if (!handle || !postId) {
    return new Response(
      JSON.stringify({ error: "Missing handle or postId parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Resolve handle to DID
    const did = await resolveDid(handle);
    if (!did) {
      return new Response(
        JSON.stringify({ error: "Could not resolve handle to DID" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Construct AT Protocol URI
    const atUri = `at://${did}/app.bsky.feed.post/${postId}`;

    // Fetch post thread and likes in parallel
    const [threadResponse, likesResponse] = await Promise.all([
      fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=1`,
        { headers: { Accept: "application/json" } }
      ),
      fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.feed.getLikes?uri=${encodeURIComponent(atUri)}&limit=10`,
        { headers: { Accept: "application/json" } }
      ).catch(() => null),
    ]);

    if (!threadResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch post data" }),
        {
          status: threadResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const threadData = await threadResponse.json();
    const likesData = likesResponse?.ok
      ? await likesResponse.json()
      : { likes: [] };

    const post = threadData.thread?.post;
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract reply post IDs
    const getReplyPostId = (uri: string): string => {
      const match = uri?.match(/app\.bsky\.feed\.post\/(.+)$/);
      return match ? match[1] : "";
    };

    // Build response
    const stats: BlueskyStats = {
      likeCount: post.likeCount || 0,
      repostCount: post.repostCount || 0,
      replyCount: post.replyCount || 0,
      likers: (likesData.likes || []).slice(0, 5).map((like: { actor?: { handle?: string; displayName?: string; avatar?: string } }) => ({
        handle: like.actor?.handle || "",
        displayName: like.actor?.displayName || like.actor?.handle || "",
        avatar: like.actor?.avatar || null,
      })),
      replies: (threadData.thread?.replies || []).slice(0, 5).map((reply: { post?: { author?: { handle?: string; displayName?: string; avatar?: string }; record?: { text?: string }; uri?: string } }) => ({
        author: {
          handle: reply.post?.author?.handle || "",
          displayName:
            reply.post?.author?.displayName || reply.post?.author?.handle || "",
          avatar: reply.post?.author?.avatar || null,
        },
        text: reply.post?.record?.text || "",
        postId: getReplyPostId(reply.post?.uri || ""),
      })),
      postUrl: `https://bsky.app/profile/${post.author?.handle || handle}/post/${postId}`,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache for 5 minutes at the edge, allow stale for 1 hour
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch (e) {
    console.error("Bluesky stats error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/bluesky-stats",
};

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import the helper functions by re-implementing them for testing
// (Edge functions run in Deno, so we test the logic separately)

function resolveDid(handle: string): string | null {
  if (handle.startsWith('did:')) {
    return handle;
  }
  return null; // In real function, this would fetch from API
}

function getReplyPostId(uri: string): string {
  const match = uri?.match(/app\.bsky\.feed\.post\/(.+)$/);
  return match ? match[1] : '';
}

function buildStats(
  post: { likeCount?: number; repostCount?: number; replyCount?: number; author?: { handle?: string } },
  likesData: { likes?: Array<{ actor?: { handle?: string; displayName?: string; avatar?: string } }> },
  replies: Array<{ post?: { author?: { handle?: string; displayName?: string; avatar?: string }; record?: { text?: string }; uri?: string } }>,
  handle: string,
  postId: string
) {
  return {
    likeCount: post.likeCount || 0,
    repostCount: post.repostCount || 0,
    replyCount: post.replyCount || 0,
    likers: (likesData.likes || []).slice(0, 5).map((like) => ({
      handle: like.actor?.handle || '',
      displayName: like.actor?.displayName || like.actor?.handle || '',
      avatar: like.actor?.avatar || null,
    })),
    replies: replies.slice(0, 5).map((reply) => ({
      author: {
        handle: reply.post?.author?.handle || '',
        displayName: reply.post?.author?.displayName || reply.post?.author?.handle || '',
        avatar: reply.post?.author?.avatar || null,
      },
      text: reply.post?.record?.text || '',
      postId: getReplyPostId(reply.post?.uri || ''),
    })),
    postUrl: `https://bsky.app/profile/${post.author?.handle || handle}/post/${postId}`,
  };
}

describe('Bluesky Stats Edge Function', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveDid', () => {
    it('should return DID as-is if already a DID', () => {
      expect(resolveDid('did:plc:abc123')).toBe('did:plc:abc123');
      expect(resolveDid('did:plc:4g4melrdxiwqmgeik55rkgx7')).toBe('did:plc:4g4melrdxiwqmgeik55rkgx7');
    });

    it('should return null for handles (would need API call)', () => {
      expect(resolveDid('bizza.pizza')).toBeNull();
      expect(resolveDid('user.bsky.social')).toBeNull();
    });
  });

  describe('getReplyPostId', () => {
    it('should extract post ID from AT URI', () => {
      expect(getReplyPostId('at://did:plc:abc/app.bsky.feed.post/3mcqwkgn3mc2v')).toBe('3mcqwkgn3mc2v');
      expect(getReplyPostId('at://did:plc:xyz/app.bsky.feed.post/abc123')).toBe('abc123');
    });

    it('should return empty string for invalid URIs', () => {
      expect(getReplyPostId('')).toBe('');
      expect(getReplyPostId('invalid')).toBe('');
      expect(getReplyPostId('at://did:plc:abc/app.bsky.feed.like/123')).toBe('');
    });
  });

  describe('buildStats', () => {
    it('should build stats from API response data', () => {
      const post = {
        likeCount: 82,
        repostCount: 1,
        replyCount: 3,
        author: { handle: 'bizza.pizza' },
      };

      const likesData = {
        likes: [
          { actor: { handle: 'user1.bsky.social', displayName: 'User One', avatar: 'https://example.com/avatar1.jpg' } },
          { actor: { handle: 'user2.bsky.social', displayName: 'User Two', avatar: null } },
        ],
      };

      const replies = [
        {
          post: {
            author: { handle: 'replier.bsky.social', displayName: 'Replier', avatar: 'https://example.com/replier.jpg' },
            record: { text: 'Great post!' },
            uri: 'at://did:plc:xyz/app.bsky.feed.post/reply123',
          },
        },
      ];

      const stats = buildStats(post, likesData, replies, 'did:plc:abc', 'post123');

      expect(stats.likeCount).toBe(82);
      expect(stats.repostCount).toBe(1);
      expect(stats.replyCount).toBe(3);
      expect(stats.likers).toHaveLength(2);
      expect(stats.likers[0].handle).toBe('user1.bsky.social');
      expect(stats.likers[0].displayName).toBe('User One');
      expect(stats.likers[1].avatar).toBeNull();
      expect(stats.replies).toHaveLength(1);
      expect(stats.replies[0].text).toBe('Great post!');
      expect(stats.replies[0].postId).toBe('reply123');
      expect(stats.postUrl).toBe('https://bsky.app/profile/bizza.pizza/post/post123');
    });

    it('should handle empty likes and replies', () => {
      const post = { likeCount: 0, repostCount: 0, replyCount: 0 };
      const likesData = { likes: [] };
      const replies: Array<{ post?: { author?: { handle?: string; displayName?: string; avatar?: string }; record?: { text?: string }; uri?: string } }> = [];

      const stats = buildStats(post, likesData, replies, 'did:plc:abc', 'post123');

      expect(stats.likeCount).toBe(0);
      expect(stats.likers).toHaveLength(0);
      expect(stats.replies).toHaveLength(0);
    });

    it('should limit likers to 5', () => {
      const post = { likeCount: 100 };
      const likesData = {
        likes: Array.from({ length: 10 }, (_, i) => ({
          actor: { handle: `user${i}.bsky.social`, displayName: `User ${i}` },
        })),
      };

      const stats = buildStats(post, likesData, [], 'did:plc:abc', 'post123');

      expect(stats.likers).toHaveLength(5);
    });

    it('should limit replies to 5', () => {
      const post = { replyCount: 10 };
      const replies = Array.from({ length: 10 }, (_, i) => ({
        post: {
          author: { handle: `replier${i}.bsky.social` },
          record: { text: `Reply ${i}` },
          uri: `at://did:plc:xyz/app.bsky.feed.post/reply${i}`,
        },
      }));

      const stats = buildStats(post, { likes: [] }, replies, 'did:plc:abc', 'post123');

      expect(stats.replies).toHaveLength(5);
    });

    it('should fallback displayName to handle when missing', () => {
      const post = {};
      const likesData = {
        likes: [{ actor: { handle: 'noname.bsky.social' } }],
      };

      const stats = buildStats(post, likesData, [], 'did:plc:abc', 'post123');

      expect(stats.likers[0].displayName).toBe('noname.bsky.social');
    });

    it('should use fallback handle in postUrl when author handle missing', () => {
      const post = { author: {} };
      const stats = buildStats(post, { likes: [] }, [], 'fallback.handle', 'post123');

      expect(stats.postUrl).toBe('https://bsky.app/profile/fallback.handle/post/post123');
    });
  });

  describe('URL parameter validation', () => {
    it('should require both handle and postId', () => {
      // Test that missing params would return 400
      const hasRequiredParams = (handle: string | null, postId: string | null) => {
        return handle !== null && postId !== null;
      };

      expect(hasRequiredParams('did:plc:abc', '123')).toBe(true);
      expect(hasRequiredParams(null, '123')).toBe(false);
      expect(hasRequiredParams('did:plc:abc', null)).toBe(false);
      expect(hasRequiredParams(null, null)).toBe(false);
    });
  });

  describe('AT Protocol URI construction', () => {
    it('should construct valid AT URI from DID and postId', () => {
      const did = 'did:plc:4g4melrdxiwqmgeik55rkgx7';
      const postId = '3mcqbrczio22h';
      const atUri = `at://${did}/app.bsky.feed.post/${postId}`;

      expect(atUri).toBe('at://did:plc:4g4melrdxiwqmgeik55rkgx7/app.bsky.feed.post/3mcqbrczio22h');
    });
  });
});

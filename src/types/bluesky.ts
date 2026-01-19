export interface BlueskyLiker {
  handle: string;
  displayName: string;
  avatar: string | null;
}

export interface BlueskyReplyAuthor {
  handle: string;
  displayName: string;
  avatar: string | null;
}

export interface BlueskyReply {
  author: BlueskyReplyAuthor;
  text: string;
  postId: string;
}

export interface BlueskyStats {
  likeCount: number;
  repostCount: number;
  replyCount: number;
  likers: BlueskyLiker[];
  replies: BlueskyReply[];
  postUrl: string;
}

// API response types
export interface BlueskyActor {
  handle?: string;
  displayName?: string;
  avatar?: string;
}

export interface BlueskyLikeResponse {
  actor?: BlueskyActor;
}

export interface BlueskyReplyPost {
  author?: BlueskyActor;
  record?: { text?: string };
  uri?: string;
}

export interface BlueskyReplyResponse {
  post?: BlueskyReplyPost;
}

export interface BlueskyPost {
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
  author?: BlueskyActor;
}

export interface BlueskyThread {
  post?: BlueskyPost;
  replies?: BlueskyReplyResponse[];
}

export interface BlueskyThreadResponse {
  thread?: BlueskyThread;
}

export interface BlueskyLikesResponse {
  likes?: BlueskyLikeResponse[];
}

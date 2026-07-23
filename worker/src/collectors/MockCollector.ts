import { InstagramCollector, NormalizedAccountProfile, NormalizedPost } from '../types/collector'

export class MockCollector implements InstagramCollector {
  async getAccountProfile(username: string): Promise<NormalizedAccountProfile> {
    return {
      username,
      displayName: `Sample ${username}`,
      profileImageUrl: '',
      followers: 18300,
      following: 480,
      mediaCount: 72,
      collectedAt: new Date().toISOString(),
    }
  }

  async getRecentPosts(username: string): Promise<NormalizedPost[]> {
    return [
      {
        externalPostId: `${username}-post-001`,
        username,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        postType: 'carousel',
        caption: 'Mock launch update with engagement details.',
        postUrl: `https://instagram.com/p/${username}-post-001`,
        thumbnailUrl: '',
        views: 4800,
        likes: 215,
        comments: 28,
      },
      {
        externalPostId: `${username}-post-002`,
        username,
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        postType: 'image',
        caption: 'Mock community post to demonstrate analytics.',
        postUrl: `https://instagram.com/p/${username}-post-002`,
        thumbnailUrl: '',
        views: 3200,
        likes: 180,
        comments: 18,
      },
    ]
  }

  async getPostMetrics(postId: string): Promise<Partial<NormalizedPost>> {
    return {
      views: 3200,
      likes: 178,
      comments: 22,
    }
  }
}

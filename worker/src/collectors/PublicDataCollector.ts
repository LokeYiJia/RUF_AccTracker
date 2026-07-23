import { InstagramCollector, NormalizedAccountProfile, NormalizedPost } from '../types/collector'

export class PublicDataCollector implements InstagramCollector {
  async getAccountProfile(username: string): Promise<NormalizedAccountProfile> {
    // TODO: implement a real public-data collector path that normalizes profile response.
    throw new Error('PublicDataCollector is not implemented yet')
  }

  async getRecentPosts(username: string): Promise<NormalizedPost[]> {
    // TODO: implement a real public-data collector path that normalizes recent posts.
    throw new Error('PublicDataCollector is not implemented yet')
  }

  async getPostMetrics(postId: string): Promise<Partial<NormalizedPost>> {
    // TODO: implement a real public-data collector path that normalizes post metrics.
    throw new Error('PublicDataCollector is not implemented yet')
  }
}

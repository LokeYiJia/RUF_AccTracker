import { InstagramCollector, NormalizedAccountProfile, NormalizedPost } from '../types/collector'

export class MetaCollector implements InstagramCollector {
  async getAccountProfile(username: string): Promise<NormalizedAccountProfile> {
    // TODO: implement Meta Graph API collection and normalize profile data.
    throw new Error('MetaCollector is not implemented yet')
  }

  async getRecentPosts(username: string): Promise<NormalizedPost[]> {
    // TODO: implement Meta Graph API collection and normalize recent posts.
    throw new Error('MetaCollector is not implemented yet')
  }

  async getPostMetrics(postId: string): Promise<Partial<NormalizedPost>> {
    // TODO: implement Meta Graph API collection and normalize post metrics.
    throw new Error('MetaCollector is not implemented yet')
  }
}

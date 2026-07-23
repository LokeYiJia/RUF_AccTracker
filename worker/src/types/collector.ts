export interface NormalizedAccountProfile {
  username: string
  displayName?: string
  profileImageUrl?: string
  followers?: number
  following?: number
  mediaCount?: number
  collectedAt: string
}

export interface NormalizedPost {
  externalPostId: string
  username: string
  publishedAt: string
  postType?: string
  caption?: string
  postUrl?: string
  thumbnailUrl?: string
  views?: number
  likes?: number
  comments?: number
}

export interface InstagramCollector {
  getAccountProfile(username: string): Promise<NormalizedAccountProfile>
  getRecentPosts(username: string): Promise<NormalizedPost[]>
  getPostMetrics(postId: string): Promise<Partial<NormalizedPost>>
}

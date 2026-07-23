import type { NormalizedAccountProfile, NormalizedPost } from '../types/collector'

export const mockAccounts = [
  {
    id: 'acct-1',
    username: 'sample_brand',
    display_name: 'Sample Brand',
    profile_image_url: '',
    collection_source: 'mock',
    active: true,
    added_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    last_collected_at: new Date().toISOString(),
  },
  {
    id: 'acct-2',
    username: 'community_creator',
    display_name: 'Community Creator',
    profile_image_url: '',
    collection_source: 'mock',
    active: true,
    added_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
    last_collected_at: new Date().toISOString(),
  },
]

export const mockSnapshots = {
  'acct-1': [
    { collected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), followers: 17840 },
    { collected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), followers: 18050 },
    { collected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), followers: 18180 },
    { collected_at: new Date().toISOString(), followers: 18300 },
  ],
  'acct-2': [
    { collected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), followers: 47320 },
    { collected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), followers: 47880 },
    { collected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), followers: 47920 },
    { collected_at: new Date().toISOString(), followers: 48200 },
  ],
}

export const mockPosts: Record<string, Array<NormalizedPost & { id: string }>> = {
  'acct-1': [
    {
      id: 'post-1',
      externalPostId: 'sample_brand-post-001',
      username: 'sample_brand',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      postType: 'carousel',
      caption: 'Launch week update on reach and engagement.',
      postUrl: 'https://instagram.com/p/sample_brand-post-001',
      thumbnailUrl: '',
      views: 4200,
      likes: 210,
      comments: 34,
      comments: 34,
    },
    {
      id: 'post-2',
      externalPostId: 'sample_brand-post-002',
      username: 'sample_brand',
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      postType: 'image',
      caption: 'Community feature from this week.',
      postUrl: 'https://instagram.com/p/sample_brand-post-002',
      thumbnailUrl: '',
      views: 3200,
      likes: 165,
      comments: 25,
    },
  ],
  'acct-2': [
    {
      id: 'post-3',
      externalPostId: 'community_creator-post-001',
      username: 'community_creator',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      postType: 'video',
      caption: 'Event highlights and community celebration.',
      postUrl: 'https://instagram.com/p/community_creator-post-001',
      thumbnailUrl: '',
      views: 7600,
      likes: 315,
      comments: 54,
    },
    {
      id: 'post-4',
      externalPostId: 'community_creator-post-002',
      username: 'community_creator',
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      postType: 'image',
      caption: 'Feeling grateful for the support and growth.',
      postUrl: 'https://instagram.com/p/community_creator-post-002',
      thumbnailUrl: '',
      views: 5400,
      likes: 265,
      comments: 41,
    },
  ],
}

export const mockProfileMetrics = {
  'sample_brand': {
    username: 'sample_brand',
    displayName: 'Sample Brand',
    profileImageUrl: '',
    followers: 18300,
    following: 480,
    mediaCount: 72,
    collectedAt: new Date().toISOString(),
  },
  'community_creator': {
    username: 'community_creator',
    displayName: 'Community Creator',
    profileImageUrl: '',
    followers: 48200,
    following: 1220,
    mediaCount: 253,
    collectedAt: new Date().toISOString(),
  },
}

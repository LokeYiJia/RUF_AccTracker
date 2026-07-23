export interface AccountSummary {
  id: string
  username: string
  display_name?: string
  profile_image_url?: string
  followers?: number
  last_collected_at?: string
  active: boolean
  follower_growth_7d?: number
  follower_growth_30d?: number
  growth_percentage_30d?: number
  posts_last_30d?: number
  average_posts_per_week?: number
  average_engagement_rate?: number
}

export interface PostItem {
  id: string
  instagram_post_id: string
  account_id: string
  published_at: string
  post_type?: string
  caption?: string
  post_url?: string
  thumbnail_url?: string
  primary_category?: string
  secondary_category?: string
  category_source?: string
  category_confidence?: number
  views?: number
  likes?: number
  comments?: number
  engagement_rate?: number
  relative_performance?: string
}

export interface AccountDetail {
  id: string
  username: string
  display_name?: string
  profile_image_url?: string
  followers?: number
  following?: number
  media_count?: number
  last_collected_at?: string
  snapshots?: Array<{ collected_at: string; followers?: number }>
  posts?: PostItem[]
}

export interface DashboardMetrics {
  follower_growth: Array<{ username: string; value: number }>
  growth_percentage_30d: Array<{ username: string; value: number }>
  posting_frequency: Array<{ username: string; value: number }>
  average_engagement_rate: Array<{ username: string; value: number }>
}

export interface ContentAnalysisRow {
  category: string
  post_count: number
  avg_views: number | null
  median_views: number | null
  avg_likes: number | null
  avg_comments: number | null
  avg_engagement_rate: number | null
  median_engagement_rate: number | null
  avg_relative_performance: number | null
}

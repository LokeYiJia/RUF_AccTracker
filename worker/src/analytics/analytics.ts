export function getClosestSnapshot<T extends { collected_at: string }>(snapshots: T[], targetDate: Date) {
  if (!snapshots?.length) return null
  return snapshots.reduce((closest, snapshot) => {
    const currentDelta = Math.abs(new Date(snapshot.collected_at).getTime() - targetDate.getTime())
    const closestDelta = Math.abs(new Date(closest.collected_at).getTime() - targetDate.getTime())
    return currentDelta < closestDelta ? snapshot : closest
  })
}

export function calculateFollowerGrowth(currentFollowers: number | null | undefined, snapshots: Array<{ collected_at: string; followers?: number }>, days: number) {
  if (currentFollowers == null || !snapshots?.length) return null
  const targetDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const closest = getClosestSnapshot(snapshots, targetDate)
  if (!closest?.followers) return null
  return currentFollowers - closest.followers
}

export function calculateGrowthPercentage(currentFollowers: number | null | undefined, baseFollowers: number | null | undefined) {
  if (currentFollowers == null || baseFollowers == null || baseFollowers <= 0) return null
  return ((currentFollowers - baseFollowers) / baseFollowers) * 100
}

export function postsInLastDays(posts: Array<{ published_at: string }>, days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  return posts.filter((post) => new Date(post.published_at).getTime() >= threshold).length
}

export function postsPerWeek(posts: Array<{ published_at: string }>) {
  const count = postsInLastDays(posts, 30)
  return +(count / (30 / 7)).toFixed(1)
}

export function averageDaysBetweenPosts(posts: Array<{ published_at: string }>) {
  if (posts.length < 2) return null
  const sorted = [...posts].sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime())
  let totalDistance = 0
  for (let i = 1; i < sorted.length; i++) {
    const prior = new Date(sorted[i - 1].published_at).getTime()
    const current = new Date(sorted[i].published_at).getTime()
    totalDistance += current - prior
  }
  return +(totalDistance / (sorted.length - 1) / (1000 * 60 * 60 * 24)).toFixed(1)
}

export function engagementRate(likes?: number, comments?: number, followerCount?: number) {
  if (likes == null || comments == null || followerCount == null || followerCount === 0) return null
  return +(((likes + comments) / followerCount) * 100).toFixed(1)
}

export function median(numbers: number[]) {
  if (!numbers.length) return null
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function relativePerformance(currentEngagement: number | null, previousEngagements: number[]) {
  if (currentEngagement == null) return null
  const history = previousEngagements.filter((value) => value > 0)
  if (!history.length) return '1.0x'
  const medianValue = median(history)
  if (!medianValue || medianValue === 0) return '1.0x'
  return `${(currentEngagement / medianValue).toFixed(1)}x`
}

export function viewsPerFollower(views?: number, followerCount?: number) {
  if (views == null || followerCount == null || followerCount === 0) return null
  return +(views / followerCount).toFixed(3)
}

export function analyzeContentPerformance(posts: Array<{
  primary_category?: string
  views?: number
  likes?: number
  comments?: number
  engagement_rate?: number
  relative_performance?: string
}>) {
  const groups = new Map<string, Array<typeof posts[number]>>()
  posts.forEach((post) => {
    const category = post.primary_category || 'Other'
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category)!.push(post)
  })

  return Array.from(groups.entries()).map(([category, rows]) => {
    const views = rows.map((row) => row.views ?? 0).filter((value) => value != null)
    const likes = rows.map((row) => row.likes ?? 0).filter((value) => value != null)
    const comments = rows.map((row) => row.comments ?? 0).filter((value) => value != null)
    const engagement = rows.map((row) => row.engagement_rate ?? 0).filter((value) => value != null)
    const relative = rows
      .map((row) => Number(row.relative_performance?.replace('x', '')))
      .filter((value) => !Number.isNaN(value) && value != null)

    return {
      category,
      post_count: rows.length,
      avg_views: views.length ? +(views.reduce((a, b) => a + b, 0) / views.length).toFixed(0) : null,
      median_views: median(views) ?? null,
      avg_likes: likes.length ? +(likes.reduce((a, b) => a + b, 0) / likes.length).toFixed(0) : null,
      avg_comments: comments.length ? +(comments.reduce((a, b) => a + b, 0) / comments.length).toFixed(0) : null,
      avg_engagement_rate: engagement.length ? +(engagement.reduce((a, b) => a + b, 0) / engagement.length).toFixed(1) : null,
      median_engagement_rate: median(engagement) ?? null,
      avg_relative_performance: relative.length ? +(relative.reduce((a, b) => a + b, 0) / relative.length).toFixed(1) : null,
    }
  })
}

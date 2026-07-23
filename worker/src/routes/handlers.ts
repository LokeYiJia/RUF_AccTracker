import type { Env } from '../types/env'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '../database/client'
import {
  createAccount,
  deactivateAccount,
  fetchAccountById,
  fetchAccountSnapshots,
  fetchAccounts,
  fetchPostByExternalId,
  fetchRecentPosts,
  fetchRecentPostsForAccount,
  fetchPostSnapshots,
  fetchActiveAccounts,
  insertAccountSnapshot,
  insertPost,
  insertPostSnapshot,
  insertCollectionRun,
  updateCollectionRun,
  updateAccountCollectionTime,
  updatePostCategory,
} from '../database/queries'
import { collector } from '../collectors'
import { json, text } from '../utils/response'
import {
  calculateFollowerGrowth,
  calculateGrowthPercentage,
  engagementRate,
  median,
  postsInLastDays,
  postsPerWeek,
  relativePerformance,
  averageDaysBetweenPosts,
  analyzeContentPerformance,
} from '../analytics/analytics'
import type { NormalizedPost } from '../types/collector'

function getClient(env: Env): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createSupabaseClient(env)
}

function serializeError(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function getAccountsHandler(request: Request, env: Env) {
  const supabase = getClient(env)
  if (!supabase) {
    return json({ accounts: [] })
  }

  const accounts = await fetchAccounts(supabase)
  const summaries = await Promise.all(
    accounts.map(async (account: any) => {
      const snapshots = await fetchAccountSnapshots(supabase, account.id)
      const latestSnapshot = snapshots[snapshots.length - 1]
      const posts = await fetchRecentPostsForAccount(supabase, account.id)
      const followerGrowth7d = calculateFollowerGrowth(latestSnapshot?.followers ?? null, snapshots, 7)
      const followerGrowth30d = calculateFollowerGrowth(latestSnapshot?.followers ?? null, snapshots, 30)
      const baseSnapshot = snapshots.length ? snapshots[0] : null
      const growthPercentage30d = calculateGrowthPercentage(latestSnapshot?.followers ?? null, baseSnapshot?.followers ?? null)
      const postsLast30d = postsInLastDays(posts, 30)
      const averagePostsPerWeek = postsPerWeek(posts)
      const engagementValues = posts
        .map((post: any) => engagementRate(post.likes, post.comments, latestSnapshot?.followers))
        .filter((value) => value != null) as number[]
      const averageEngagementRate = engagementValues.length
        ? +(engagementValues.reduce((sum, value) => sum + value, 0) / engagementValues.length).toFixed(1)
        : null

      return {
        id: account.id,
        username: account.username,
        display_name: account.display_name,
        profile_image_url: account.profile_image_url,
        followers: latestSnapshot?.followers ?? null,
        last_collected_at: account.last_collected_at,
        active: account.active,
        follower_growth_7d: followerGrowth7d,
        follower_growth_30d: followerGrowth30d,
        growth_percentage_30d: growthPercentage30d,
        posts_last_30d: postsLast30d,
        average_posts_per_week: averagePostsPerWeek,
        average_engagement_rate: averageEngagementRate,
      }
    }),
  )

  return json({ accounts: summaries })
}

export async function createAccountHandler(request: Request, env: Env) {
  const supabase = getClient(env)
  if (!supabase) return json({ message: 'Supabase not configured' }, 500)
  const payload = await request.json()
  const username = payload?.username?.trim()
  if (!username) return json({ message: 'username is required' }, 400)
  const account = await createAccount(supabase, username, 'mock')
  return json({ account })
}

export async function deactivateAccountHandler(request: Request, env: Env, accountId: string) {
  const supabase = getClient(env)
  if (!supabase) return json({ message: 'Supabase not configured' }, 500)
  const account = await deactivateAccount(supabase, accountId)
  return json({ account })
}

export async function getAccountDetailHandler(request: Request, env: Env, accountId: string) {
  const supabase = getClient(env)
  if (!supabase) return json({ account: null })
  const account = await fetchAccountById(supabase, accountId)
  const snapshots = await fetchAccountSnapshots(supabase, accountId)
  const posts = await fetchRecentPostsForAccount(supabase, accountId)
  const enrichedPosts = await Promise.all(
    posts.map(async (post: any) => {
      const snapshots = await fetchPostSnapshots(supabase, post.id)
      const latest = snapshots[snapshots.length - 1]
      const engagement = engagementRate(latest?.likes, latest?.comments, account?.followers)
      return {
        ...post,
        views: latest?.views ?? null,
        likes: latest?.likes ?? null,
        comments: latest?.comments ?? null,
        engagement_rate: engagement,
        relative_performance: '1.0x',
      }
    }),
  )

  return json({ account: { ...account, snapshots, posts: enrichedPosts } })
}

export async function getAccountAnalyticsHandler(request: Request, env: Env, accountId: string) {
  const supabase = getClient(env)
  if (!supabase) return json({ analytics: null })
  const account = await fetchAccountById(supabase, accountId)
  const snapshots = await fetchAccountSnapshots(supabase, accountId)
  const posts = await fetchRecentPostsForAccount(supabase, accountId)
  const latestSnapshot = snapshots[snapshots.length - 1]
  const followerGrowth7d = calculateFollowerGrowth(latestSnapshot?.followers ?? null, snapshots, 7)
  const followerGrowth30d = calculateFollowerGrowth(latestSnapshot?.followers ?? null, snapshots, 30)
  const growthRate30d = calculateGrowthPercentage(latestSnapshot?.followers ?? null, snapshots[0]?.followers ?? null)
  const postCount30d = postsInLastDays(posts, 30)
  const postCount7d = postsInLastDays(posts, 7)
  const postsPerWeekValue = postsPerWeek(posts)
  const averageDaysBetween = averageDaysBetweenPosts(posts)
  const engagementValues = posts
    .map((post: any) => engagementRate(post.likes, post.comments, latestSnapshot?.followers))
    .filter((value) => value != null) as number[]
  const averageEngagementRate = engagementValues.length
    ? +(engagementValues.reduce((sum, value) => sum + value, 0) / engagementValues.length).toFixed(1)
    : null

  return json({
    analytics: {
      current_followers: latestSnapshot?.followers ?? null,
      follower_growth_7d: followerGrowth7d,
      follower_growth_30d: followerGrowth30d,
      growth_rate_30d: growthRate30d,
      posts_last_7d: postCount7d,
      posts_last_30d: postCount30d,
      posts_per_week: postsPerWeekValue,
      average_days_between_posts: averageDaysBetween,
      average_engagement_rate: averageEngagementRate,
    },
  })
}

export async function getAccountPostsHandler(request: Request, env: Env, accountId: string) {
  const supabase = getClient(env)
  if (!supabase) return json({ posts: [] })
  const posts = await fetchRecentPostsForAccount(supabase, accountId)
  const enriched = await Promise.all(
    posts.map(async (post: any, index: number) => {
      const snapshots = await fetchPostSnapshots(supabase, post.id)
      const latest = snapshots[snapshots.length - 1]
      const engagement = engagementRate(latest?.likes, latest?.comments, null)
      const priorEngagements = posts
        .slice(Math.max(0, index - 10), index)
        .map((prior: any) => engagementRate(prior.likes, prior.comments, null) ?? 0)
      return {
        ...post,
        views: latest?.views ?? null,
        likes: latest?.likes ?? null,
        comments: latest?.comments ?? null,
        engagement_rate: engagement,
        relative_performance: relativePerformance(engagement, priorEngagements as number[]),
      }
    }),
  )
  return json({ posts: enriched })
}

export async function getDashboardHandler(request: Request, env: Env) {
  const accountsResponse = await getAccountsHandler(request, env)
  if (accountsResponse.status !== 200) {
    return accountsResponse
  }
  const payload = await accountsResponse.json()
  const accounts = payload.accounts ?? []
  const metrics = {
    follower_growth: accounts.map((account: any) => ({ username: account.username, value: account.follower_growth_30d ?? 0 })),
    growth_percentage_30d: accounts.map((account: any) => ({ username: account.username, value: account.growth_percentage_30d ?? 0 })),
    posting_frequency: accounts.map((account: any) => ({ username: account.username, value: account.average_posts_per_week ?? 0 })),
    average_engagement_rate: accounts.map((account: any) => ({ username: account.username, value: account.average_engagement_rate ?? 0 })),
  }
  return json({ metrics })
}

export async function getContentAnalysisHandler(request: Request, env: Env) {
  const supabase = getClient(env)
  if (!supabase) return json({ content_analysis: [] })
  const accounts = await fetchAccounts(supabase)
  const allPosts = []
  for (const account of accounts) {
    const posts = await fetchRecentPostsForAccount(supabase, account.id)
    const withMetrics = await Promise.all(
      posts.map(async (post: any) => {
        const snapshots = await fetchPostSnapshots(supabase, post.id)
        const latest = snapshots[snapshots.length - 1]
        const engagement = engagementRate(latest?.likes, latest?.comments, null)
        return {
          primary_category: post.primary_category,
          views: latest?.views ?? null,
          likes: latest?.likes ?? null,
          comments: latest?.comments ?? null,
          engagement_rate: engagement,
          relative_performance: relativePerformance(engagement, []),
        }
      }),
    )
    allPosts.push(...withMetrics)
  }
  return json({ content_analysis: analyzeContentPerformance(allPosts) })
}

export async function patchPostCategoryHandler(request: Request, env: Env, postId: string) {
  const supabase = getClient(env)
  if (!supabase) return json({ message: 'Supabase not configured' }, 500)
  const payload = await request.json()
  const primaryCategory = payload?.primary_category
  const secondaryCategory = payload?.secondary_category
  if (!primaryCategory) return json({ message: 'primary_category is required' }, 400)
  const post = await updatePostCategory(supabase, postId, primaryCategory, secondaryCategory)
  return json({ post })
}

export async function collectAccountSnapshotsHandler(env: Env) {
  const supabase = getClient(env)
  if (!supabase) {
    return text('Supabase not configured', 500)
  }
  const run = await insertCollectionRun(supabase, 'account_snapshot')
  const accounts = await fetchActiveAccounts(supabase)
  let success = 0
  let failed = 0

  for (const account of accounts) {
    try {
      const profile = await collector.getAccountProfile(account.username)
      await insertAccountSnapshot(supabase, account.id, profile)
      await updateAccountCollectionTime(supabase, account.id, profile.collectedAt)
      success += 1
    } catch (error) {
      failed += 1
      console.error(`Account snapshot failed for ${account.username}:`, serializeError(error))
    }
  }

  await updateCollectionRun(supabase, run.id, {
    finished_at: new Date().toISOString(),
    accounts_attempted: accounts.length,
    accounts_successful: success,
    accounts_failed: failed,
    status: failed ? 'partial_failure' : 'success',
  })
  return text(`Account snapshot collection finished. ${success} succeeded, ${failed} failed.`)
}

export async function collectPostSnapshotsHandler(env: Env) {
  const supabase = getClient(env)
  if (!supabase) {
    return text('Supabase not configured', 500)
  }
  const run = await insertCollectionRun(supabase, 'post_collection')
  const accounts = await fetchActiveAccounts(supabase)
  let success = 0
  let failed = 0

  for (const account of accounts) {
    try {
      const posts = await collector.getRecentPosts(account.username)
      for (const normalizedPost of posts) {
        const existing = await fetchPostByExternalId(supabase, normalizedPost.externalPostId)
        const postRecord = existing ?? await insertPost(supabase, account.id, normalizedPost)
        const metrics = normalizedPost.views || normalizedPost.likes || normalizedPost.comments ? normalizedPost : await collector.getPostMetrics(normalizedPost.externalPostId)
        await insertPostSnapshot(supabase, postRecord.id, metrics)
      }
      success += 1
    } catch (error) {
      failed += 1
      console.error(`Post collection failed for ${account.username}:`, serializeError(error))
    }
  }

  await updateCollectionRun(supabase, run.id, {
    finished_at: new Date().toISOString(),
    accounts_attempted: accounts.length,
    accounts_successful: success,
    accounts_failed: failed,
    status: failed ? 'partial_failure' : 'success',
  })
  return text(`Post collection finished. ${success} succeeded, ${failed} failed.`)
}

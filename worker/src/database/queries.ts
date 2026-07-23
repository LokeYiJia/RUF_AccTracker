import type { SupabaseClient } from '@supabase/supabase-js'
import type { NormalizedAccountProfile, NormalizedPost } from '../types/collector'

export async function fetchAccounts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('accounts').select('*')
  if (error) throw error
  return data
}

export async function fetchActiveAccounts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('accounts').select('*').eq('active', true)
  if (error) throw error
  return data
}

export async function fetchAccountById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createAccount(supabase: SupabaseClient, username: string, collection_source: string) {
  const { data, error } = await supabase
    .from('accounts')
    .insert({ username, collection_source })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deactivateAccount(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from('accounts').update({ active: false }).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function insertAccountSnapshot(supabase: SupabaseClient, accountId: string, profile: NormalizedAccountProfile) {
  const { error } = await supabase.from('account_snapshots').insert({
    account_id: accountId,
    collected_at: profile.collectedAt,
    followers: profile.followers,
    following: profile.following,
    media_count: profile.mediaCount,
  })
  if (error) throw error
}

export async function updateAccountCollectionTime(supabase: SupabaseClient, accountId: string, collectedAt: string) {
  const { error } = await supabase.from('accounts').update({ last_collected_at: collectedAt }).eq('id', accountId)
  if (error) throw error
}

export async function fetchRecentPostsForAccount(supabase: SupabaseClient, accountId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('account_id', accountId)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPostByExternalId(supabase: SupabaseClient, externalPostId: string) {
  const { data, error } = await supabase.from('posts').select('*').eq('instagram_post_id', externalPostId).maybeSingle()
  if (error) throw error
  return data
}

export async function insertPost(supabase: SupabaseClient, accountId: string, post: NormalizedPost) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      instagram_post_id: post.externalPostId,
      account_id: accountId,
      published_at: post.publishedAt,
      post_type: post.postType,
      caption: post.caption,
      post_url: post.postUrl,
      thumbnail_url: post.thumbnailUrl,
      primary_category: 'Other',
      category_source: 'manual',
      category_confidence: 0,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function insertPostSnapshot(supabase: SupabaseClient, postId: string, metrics: Partial<NormalizedPost>) {
  const { error } = await supabase.from('post_snapshots').insert({
    post_id: postId,
    views: metrics.views,
    likes: metrics.likes,
    comments: metrics.comments,
  })
  if (error) throw error
}

export async function updatePostCategory(
  supabase: SupabaseClient,
  postId: string,
  primary_category: string,
  secondary_category?: string,
) {
  const { data, error } = await supabase
    .from('posts')
    .update({ primary_category, secondary_category, category_source: 'manual' })
    .eq('id', postId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function fetchAccountSnapshots(supabase: SupabaseClient, accountId: string) {
  const { data, error } = await supabase
    .from('account_snapshots')
    .select('*')
    .eq('account_id', accountId)
    .order('collected_at', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchPostSnapshots(supabase: SupabaseClient, postId: string) {
  const { data, error } = await supabase
    .from('post_snapshots')
    .select('*')
    .eq('post_id', postId)
    .order('collected_at', { ascending: true })
  if (error) throw error
  return data
}

export async function insertCollectionRun(supabase: SupabaseClient, status: string) {
  const { data, error } = await supabase
    .from('collection_runs')
    .insert({ started_at: new Date().toISOString(), status, accounts_attempted: 0, accounts_successful: 0, accounts_failed: 0 })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCollectionRun(supabase: SupabaseClient, id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('collection_runs').update(updates).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function fetchDashboardData(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('dashboard_metrics')
  if (error) throw error
  return data
}

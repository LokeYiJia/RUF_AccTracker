import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/PageHeader'
import LoadingCard from '../components/LoadingCard'
import { AccountDetail, PostItem } from '../types/api'

const mockDetail: AccountDetail = {
  id: 'acct-1',
  username: 'sample_brand',
  display_name: 'Sample Brand',
  profile_image_url: '',
  followers: 18300,
  following: 480,
  media_count: 72,
  last_collected_at: new Date().toISOString(),
  snapshots: [
    { collected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), followers: 17840 },
    { collected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), followers: 18050 },
    { collected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), followers: 18180 },
    { collected_at: new Date().toISOString(), followers: 18300 },
  ],
  posts: [
    {
      id: 'post-1',
      instagram_post_id: '1001',
      account_id: 'acct-1',
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      post_type: 'carousel',
      caption: 'Launch week update on reach and engagement.',
      post_url: 'https://instagram.com/p/1001',
      thumbnail_url: '',
      primary_category: 'Announcement',
      secondary_category: 'Community',
      category_source: 'manual',
      category_confidence: 0.8,
      views: 4200,
      likes: 210,
      comments: 34,
      engagement_rate: 4.2,
      relative_performance: '1.1x',
    },
    {
      id: 'post-2',
      instagram_post_id: '1002',
      account_id: 'acct-1',
      published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      post_type: 'image',
      caption: 'Community feature from this week.',
      post_url: 'https://instagram.com/p/1002',
      thumbnail_url: '',
      primary_category: 'Community',
      category_source: 'manual',
      category_confidence: 0.9,
      views: 3200,
      likes: 165,
      comments: 25,
      engagement_rate: 3.5,
      relative_performance: '0.9x',
    },
  ],
}

const sortOptions = [
  { value: 'published_at', label: 'Published date' },
  { value: 'views', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'engagement_rate', label: 'Engagement rate' },
  { value: 'relative_performance', label: 'Performance' },
]

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default function AccountPage() {
  const { id } = useParams()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('published_at')

  useEffect(() => {
    setTimeout(() => {
      setAccount(mockDetail)
      setLoading(false)
    }, 300)
  }, [id])

  const sortedPosts = useMemo(() => {
    if (!account?.posts) return []
    return [...account.posts].sort((a, b) => {
      const aValue = a[sortBy as keyof PostItem]
      const bValue = b[sortBy as keyof PostItem]
      if (sortBy === 'published_at') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue
      }
      return 0
    })
  }, [account, sortBy])

  if (loading || !account) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <LoadingCard />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={`Account: ${account.username}`} subtitle="Detailed analytics for this tracked account." />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
          <p className="mt-3 text-2xl font-semibold text-white">{account.display_name || account.username}</p>
          <p className="mt-2 text-slate-400">Followers: {account.followers ?? '—'}</p>
          <p className="mt-2 text-slate-400">Posts: {account.media_count ?? '—'}</p>
          <p className="mt-2 text-slate-400">Last collected: {formatDate(account.last_collected_at)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Follower growth</p>
          <p className="mt-3 text-3xl font-semibold text-white">{account.followers ?? '—'}</p>
          <p className="mt-2 text-slate-400">7-day change: 120</p>
          <p className="mt-2 text-slate-400">30-day change: 420</p>
          <p className="mt-2 text-slate-400">Growth rate: 2.4%</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Posting performance</p>
          <p className="mt-3 text-slate-400">Posts published: {account.posts?.length ?? 0}</p>
          <p className="mt-2 text-slate-400">Posts per week: 2.1</p>
          <p className="mt-2 text-slate-400">Avg days between posts: 3.4</p>
          <p className="mt-2 text-slate-400">Avg engagement: 4.1%</p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Follower growth over time</h2>
            <p className="text-slate-400">The latest snapshots show change across 30 days.</p>
          </div>
          <div className="text-sm text-slate-400">Updated: {formatDate(account.last_collected_at)}</div>
        </div>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={account.snapshots ?? []}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="collected_at" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="followers" stroke="#38bdf8" fillOpacity={1} fill="url(#growthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent posts</h2>
            <p className="text-slate-400">Sort by performance and update categories for analysis.</p>
          </div>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedPosts.map((post) => (
            <article key={post.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-800">
                  {post.thumbnail_url ? (
                    <img src={post.thumbnail_url} alt={post.caption} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">IMG</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a href={post.post_url} target="_blank" rel="noreferrer" className="text-base font-semibold text-sky-300 hover:text-sky-200">
                    View post
                  </a>
                  <p className="mt-2 text-sm text-slate-400">{formatDate(post.published_at)} • {post.post_type || 'Unknown'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{post.caption || 'No caption available'}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Views</p>
                  <p className="mt-2 text-lg font-semibold text-white">{post.views ?? '—'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Engagement</p>
                  <p className="mt-2 text-lg font-semibold text-white">{post.engagement_rate ?? '—'}%</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Category</p>
                  <p className="mt-2 text-lg font-semibold text-white">{post.primary_category || 'Other'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase text-slate-400">Relative score</p>
                  <p className="mt-2 text-lg font-semibold text-white">{post.relative_performance || '—'}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

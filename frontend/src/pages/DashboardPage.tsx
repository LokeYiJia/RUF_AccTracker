import { useEffect, useState } from 'react'
import { Area, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AccountCard from '../components/AccountCard'
import LoadingCard from '../components/LoadingCard'
import PageHeader from '../components/PageHeader'
import StatsCard from '../components/StatsCard'
import { AccountSummary, DashboardMetrics } from '../types/api'

const mockAccounts: AccountSummary[] = [
  {
    id: 'acct-1',
    username: 'sample_brand',
    display_name: 'Sample Brand',
    profile_image_url: '',
    followers: 18300,
    active: true,
    follower_growth_7d: 120,
    follower_growth_30d: 420,
    growth_percentage_30d: 2.4,
    posts_last_30d: 9,
    average_posts_per_week: 2.1,
    average_engagement_rate: 4.2,
    last_collected_at: new Date().toISOString(),
  },
  {
    id: 'acct-2',
    username: 'community_creator',
    display_name: 'Community Creator',
    profile_image_url: '',
    followers: 48200,
    active: true,
    follower_growth_7d: 280,
    follower_growth_30d: 880,
    growth_percentage_30d: 1.9,
    posts_last_30d: 12,
    average_posts_per_week: 2.8,
    average_engagement_rate: 3.6,
    last_collected_at: new Date().toISOString(),
  },
]

const mockMetrics: DashboardMetrics = {
  follower_growth: mockAccounts.map((account) => ({ username: account.username, value: account.follower_growth_30d ?? 0 })),
  growth_percentage_30d: mockAccounts.map((account) => ({ username: account.username, value: account.growth_percentage_30d ?? 0 })),
  posting_frequency: mockAccounts.map((account) => ({ username: account.username, value: account.average_posts_per_week ?? 0 })),
  average_engagement_rate: mockAccounts.map((account) => ({ username: account.username, value: account.average_engagement_rate ?? 0 })),
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setAccounts(mockAccounts)
      setMetrics(mockMetrics)
      setLoading(false)
    }, 300)
  }, [])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="Dashboard" subtitle="Track selected Instagram accounts and compare performance." />
      <div className="grid gap-4 xl:grid-cols-4">
        <StatsCard label="Tracked accounts" value={accounts.length} />
        <StatsCard label="Average engagement" value={`${(mockAccounts.reduce((sum, account) => sum + (account.average_engagement_rate ?? 0), 0) / mockAccounts.length).toFixed(1)}%`} />
        <StatsCard label="Total 30d growth" value={mockAccounts.reduce((sum, account) => sum + (account.follower_growth_30d ?? 0), 0)} />
        <StatsCard label="Posting frequency" value={`${(mockAccounts.reduce((sum, account) => sum + (account.average_posts_per_week ?? 0), 0) / mockAccounts.length).toFixed(1)} / week`} />
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-lg font-semibold text-white">Follower growth (30d)</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.follower_growth ?? []}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="username" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <h2 className="text-lg font-semibold text-white">Engagement and posting</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.average_engagement_rate ?? []}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="username" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="value" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Tracked accounts</h2>
            <p className="text-slate-400">Manage your manually selected accounts and open their analytics.</p>
          </div>
          <button className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
            Add account
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {loading
            ? Array.from({ length: 2 }).map((_, index) => <LoadingCard key={index} />)
            : accounts.map((account) => <AccountCard key={account.id} account={account} />)}
        </div>
      </section>
    </main>
  )
}

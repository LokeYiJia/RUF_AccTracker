import { AccountSummary } from '../types/api'
import { Link } from 'react-router-dom'

interface AccountCardProps {
  account: AccountSummary
}

export default function AccountCard({ account }: AccountCardProps) {
  return (
    <Link
      to={`/accounts/${account.id}`}
      className="group block rounded-3xl border border-slate-800 bg-slate-900/90 p-6 transition hover:border-slate-600"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-800">
          {account.profile_image_url ? (
            <img src={account.profile_image_url} alt={account.username} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-500">IG</div>
          )}
        </div>
        <div>
          <p className="text-xl font-semibold text-white">{account.username}</p>
          <p className="text-sm text-slate-400">{account.display_name || 'No display name'}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-400">Followers</p>
          <p className="mt-2 text-lg font-semibold text-white">{account.followers ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-400">7d growth</p>
          <p className="mt-2 text-lg text-white">{account.follower_growth_7d ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-400">30d growth</p>
          <p className="mt-2 text-lg text-white">{account.follower_growth_30d ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-400">Posts / 30d</p>
          <p className="mt-2 text-lg text-white">{account.posts_last_30d ?? '—'}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
        <span>30d % {account.growth_percentage_30d?.toFixed(1) ?? '—'}</span>
        <span>Engagement {account.average_engagement_rate?.toFixed(1) ?? '—'}%</span>
        <span>{account.last_collected_at ? new Date(account.last_collected_at).toLocaleDateString() : 'No data yet'}</span>
      </div>
    </Link>
  )
}

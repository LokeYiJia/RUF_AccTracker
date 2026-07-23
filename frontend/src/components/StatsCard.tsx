interface StatsCardProps {
  label: string
  value: string | number
  delta?: string
}

export default function StatsCard({ label, value, delta }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-slate-950/10">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {delta ? <p className="mt-2 text-sm text-emerald-400">{delta}</p> : null}
    </div>
  )
}

export default function LoadingCard() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
      <div className="h-5 w-32 animate-pulse rounded-full bg-slate-700" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  )
}

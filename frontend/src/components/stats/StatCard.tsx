import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { SparkLine } from './SparkLine'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string
  sub: string
  trend?: string
  variant?: 'spark' | 'confidence' | 'risk' | 'wave'
  sparkData?: number[]
  confidencePct?: number
  riskPct?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  variant = 'spark',
  sparkData = [12, 18, 14, 22, 19, 28, 23],
  confidencePct = 92,
  riskPct = 0.55,
}: StatCardProps) {
  const c = 2 * Math.PI * 26
  const offset = c * (1 - confidencePct / 100)

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="group relative flex min-h-[130px] flex-col overflow-hidden rounded-[28px] border-2 border-[#22c55e] bg-transparent p-4 shadow-[0_0_24px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(34,197,94,0.1)] backdrop-blur-3xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#39ff14]/30 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#39ff14]/20 bg-[#39ff14]/10 text-[#39ff14] shadow-[0_0_16px_rgba(57,255,20,0.12)]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-400">{label}</span>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
          <div className="mt-1 text-[12px] text-zinc-400">{sub}</div>
        </div>
        {variant === 'confidence' ? (
          <div className="relative h-[68px] w-[68px] shrink-0">
            <svg className="-rotate-90" viewBox="0 0 64 64" width="68" height="68">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#39ff14"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                className="drop-shadow-[0_0_6px_rgba(57,255,20,0.4)]"
              />
            </svg>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
        {variant === 'spark' && (
          <div className="h-8 w-full opacity-90">
            <SparkLine points={sparkData} />
          </div>
        )}
        {variant === 'risk' && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-[#39ff14] to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${riskPct * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        )}
        {variant === 'wave' && (
          <svg viewBox="0 0 120 32" className="h-7 w-full" preserveAspectRatio="none" aria-hidden>
            <path d="M0 16 Q20 6 40 16 T80 16 T120 16" fill="none" stroke="#38bdf8" strokeWidth="2" opacity={0.9} />
          </svg>
        )}
      </div>

      {trend ? <div className="mt-3 text-[11px] font-semibold text-[#39ff14]">{trend}</div> : null}
    </motion.article>
  )
}

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Activity, BarChart3, Layers, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { RingProgress } from '../components/stats/SparkLine'
import type { HistoryEntry, ModelInfo, Stats } from '../api'

type DashboardPageProps = {
  stats: Stats | null
  history: HistoryEntry[]
  modelInfo: ModelInfo | null
  loading: boolean
  onRefresh: () => Promise<void>
}

function StatCard({ title, value, label, icon, accent }: { title: string; value: string; label: string; icon: ReactNode; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass glow-green-sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 18,
        minHeight: 150,
        padding: 20,
        borderRadius: 28,
        border: '2px solid rgba(34,197,94,1)',
        background: 'transparent',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0 0 24px rgba(34,197,94,0.4), inset 0 0 20px rgba(34,197,94,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>{title}</p>
          <p style={{ marginTop: 10, fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', background: accent, boxShadow: `0 0 18px ${accent}40`, color: '#0f172a' }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'rgba(226,232,240,0.65)' }}>{label}</p>
    </motion.div>
  )
}

function ListRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function TrendChart({
  title,
  points,
  color = '#22c55e',
}: {
  title: string
  points: number[]
  color?: string
}) {
  const values = points.length > 0 ? [...points].reverse() : [0]
  const width = 320
  const height = 120
  const padX = 28
  const padY = 18
  const min = Math.min(0, ...values)
  const max = Math.max(...values, 1)
  const range = max - min || 1
  const step = values.length > 1 ? (width - padX * 2) / (values.length - 1) : 0

  const coords = values.map((value, index) => {
    const x = padX + index * step
    const y = height - padY - ((value - min) / range) * (height - padY * 2)
    return { x, y, value }
  })

  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const fillPath = coords.length
    ? `${path} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
    : ''
  const latest = values[values.length - 1] ?? 0

  return (
    <div className="glass glow-green-sm" style={{ flex: '1 1 280px', minWidth: 260, padding: 18, borderRadius: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{title}</p>
        <span style={{ color, fontSize: 13, fontWeight: 800 }}>{latest}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} trend`} style={{ width: '100%', height, display: 'block' }}>
        {[0, 1, 2].map((line) => {
          const y = padY + line * ((height - padY * 2) / 2)
          return <line key={line} x1={padX} x2={width - padX} y1={y} y2={y} stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
        })}
        <line x1={padX} x2={padX} y1={padY} y2={height - padY} stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
        <line x1={padX} x2={width - padX} y1={height - padY} y2={height - padY} stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
        <text x={4} y={padY + 4} fill="rgba(203,213,225,0.72)" fontSize="10">{max}</text>
        <text x={8} y={height - padY + 4} fill="rgba(203,213,225,0.72)" fontSize="10">{min}</text>
        {fillPath && <path d={fillPath} fill={color} opacity="0.11" />}
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={index === coords.length - 1 ? 4 : 3} fill="#07130b" stroke={color} strokeWidth="2" />
        ))}
        <text x={padX} y={height - 2} fill="rgba(203,213,225,0.62)" fontSize="10">oldest</text>
        <text x={width - padX - 30} y={height - 2} fill="rgba(203,213,225,0.62)" fontSize="10">latest</text>
      </svg>
    </div>
  )
}

export function DashboardPage({ stats, history, modelInfo, loading, onRefresh }: DashboardPageProps) {
  const recentScans = history
  const trendScans = history.slice(0, 12)
  const dashboardPanelHeight = 326

  const scanTotals = trendScans.map((entry) => entry.total)
  const weedTotals = trendScans.map((entry) => entry.weeds)
  const cropTotals = trendScans.map((entry) => entry.crops)

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: 'clamp(22px, 3vw, 32px) clamp(18px, 4vw, 44px) clamp(28px, 4vw, 32px) clamp(24px, 5vw, 92px)', color: '#d9f7dc' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{ margin: 0, color: '#8ee5aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Dashboard</p>
          <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2.4rem, 3.2vw, 3.6rem)', color: '#ffffff', lineHeight: 1.02 }}>Field intelligence delivered.</h1>
          <p style={{ marginTop: 18, maxWidth: 640, color: 'rgba(226,232,240,0.78)', fontSize: 15, lineHeight: 1.8 }}>
            Track scan performance, monitor weed pressure, and inspect model health from the same command center. Quick insights make it easy to act on the field and keep your operation efficient.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => { void onRefresh() }}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 22px',
            borderRadius: 18,
            border: '1px solid rgba(34,197,94,0.32)',
            background: 'rgba(34,197,94,0.18)',
            color: '#f8fafc',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 16px rgba(34,197,94,0.14)',
          }}
        >
          <BarChart3 size={18} />
          {loading ? 'Resetting...' : 'Reset dashboard'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginTop: 28 }}>
        <StatCard title="Total scans" value={`${stats?.total_scans ?? 0}`} label="All scans processed" icon={<Activity size={20} />} accent="rgba(34,197,94,0.16)" />
        <StatCard title="Weeds found" value={`${stats?.total_weeds ?? 0}`} label="Total weed detections" icon={<Sparkles size={20} />} accent="rgba(34,197,94,0.16)" />
        <StatCard title="Crops tracked" value={`${stats?.total_crops ?? 0}`} label="Total crop detections" icon={<Layers size={20} />} accent="rgba(34,197,94,0.16)" />
        <StatCard title="Average confidence" value={`${stats?.avg_confidence?.toFixed(0) ?? 0}%`} label="AI model accuracy" icon={<TrendingUp size={20} />} accent="rgba(34,197,94,0.16)" />
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', marginTop: 24 }}>
        <div className="glass glow-green-strong" style={{ minHeight: dashboardPanelHeight, borderRadius: 28, border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(6, 14, 8, 0.78)', padding: 24, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Scan trends</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 22 }}>Recent field activity</h2>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d9f7dc', fontSize: 12, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ShieldCheck size={16} /> Model-driven alerts
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: 18, flexWrap: 'wrap' }}>
            <TrendChart title="Total detections" points={scanTotals} color="#22c55e" />
            <TrendChart title="Weed pressure" points={weedTotals} color="#f97316" />
            <TrendChart title="Crop detections" points={cropTotals} color="#60a5fa" />
          </div>
        </div>

        <div className="glass glow-green-strong" style={{ minHeight: dashboardPanelHeight, borderRadius: 28, border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(6, 14, 8, 0.78)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Model health</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 22 }}>AI performance</h2>
            </div>
            <div style={{ width: 72, height: 72 }}>
              <RingProgress value={stats?.avg_confidence ?? 76} size={72} strokeWidth={8} color="#22c55e" />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <ListRow label="Model" value={modelInfo?.name ?? 'Unknown'} />
            <ListRow label="Architecture" value={modelInfo?.architecture ?? 'YOLOv8'} />
            <ListRow label="Classes" value={modelInfo?.classes.length ?? 0} />
            <ListRow label="Input size" value={`${modelInfo?.input_size ?? 640}px`} />
            <ListRow label="Trained images" value={modelInfo?.images_trained?.toLocaleString() ?? '—'} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', marginTop: 24 }}> 
        <div className="glass glow-green-strong" style={{ minHeight: dashboardPanelHeight, borderRadius: 28, border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(6, 14, 8, 0.78)', padding: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Recent scans</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 22 }}>Latest field reports</h2>
            </div>
            <span style={{ color: '#a7f3d0', fontSize: 12 }}>
              Showing {recentScans.length} of {stats?.total_scans ?? history.length} scans
            </span>
          </div>

          {recentScans.length === 0 ? (
            <p style={{ color: '#94a3b8', lineHeight: 1.8 }}>No recent scans available yet. Start by uploading an image or running a live detection.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
              {recentScans.map((entry) => (
                <div key={entry.id} style={{ display: 'grid', gap: 6, padding: 16, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, color: '#fff', fontWeight: 700 }}>{entry.filename}</p>
                      <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 12 }}>{entry.time_ago} • Confidence {entry.confidence}%</p>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', color: '#d9f7dc', fontSize: 12, fontWeight: 700 }}>{entry.risk_level}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
                    <div className="glass glow-green-sm" style={{ padding: 12, borderRadius: 18 }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>Crop</p>
                      <p style={{ margin: '8px 0 0', color: '#fff', fontSize: 16, fontWeight: 700 }}>{entry.crops}</p>
                    </div>
                    <div className="glass glow-green-sm" style={{ padding: 12, borderRadius: 18 }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>Weed</p>
                      <p style={{ margin: '8px 0 0', color: '#fff', fontSize: 16, fontWeight: 700 }}>{entry.weeds}</p>
                    </div>
                    <div className="glass glow-green-sm" style={{ padding: 12, borderRadius: 18 }}>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>Total</p>
                      <p style={{ margin: '8px 0 0', color: '#fff', fontSize: 16, fontWeight: 700 }}>{entry.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass glow-green-strong" style={{ minHeight: dashboardPanelHeight, borderRadius: 28, border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(6, 14, 8, 0.78)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Insights</p>
            <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 22 }}>Actionable alerts</h2>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Priority field</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 700 }}>Field 7 • High weed pressure</p>
            </div>
            <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Recommended action</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 700 }}>Increase scan frequency and apply targeted weeding.</p>
            </div>
            <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Next step</p>
              <p style={{ margin: '4px 0 0', color: '#fff', fontWeight: 700 }}>Use the scan workspace to upload the next field image.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

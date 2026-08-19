import { motion } from 'framer-motion'
import { Leaf, Sprout, Target, ShieldCheck, Droplets } from 'lucide-react'
import { SparkLine, RingProgress, WaveGraph } from './SparkLine'

type ScanMetrics = {
  total: number
  crops: number
  weeds: number
  crop_pct: number
  weed_pct: number
  avg_confidence: number
  inference_time_ms: number
  risk_level: string
}

interface StatCardProps {
  index: number
}

interface CardDataProps extends StatCardProps {
  value?: number
  confidence?: number
  riskLevel?: string
}

const iconBoxStyle = {
  width: 40,
  height: 40,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 14px rgba(34,197,94,0.14)',
  background: 'linear-gradient(180deg, rgba(34,197,94,0.22), rgba(34,197,94,0.06))',
  border: '1px solid rgba(34,197,94,0.18)',
}

function StatHeader({ trend, icon }: { trend?: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <div style={iconBoxStyle}>{icon}</div>
      {trend ? (
        <span style={{ fontSize: 10, color: 'rgba(148,225,149,0.95)', fontWeight: 600, letterSpacing: '0.06em' }}>{trend}</span>
      ) : <div />}
    </div>
  )
}

function StatLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 10, color: 'rgba(156,163,175,0.7)', marginBottom: 4 }}>{label}</div>
}

function StatValue({ value, subtext }: { value: React.ReactNode; subtext: string }) {
  return (
    <>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(156,163,175,0.6)' }}>{subtext}</div>
    </>
  )
}

// ── Card 1: Weed Detected ──
function WeedCard({ index, value = 0 }: CardDataProps) {
  return (
    <StatCardWrapper index={index} accentColor="#22c55e">
      <StatHeader trend="+12% vs last scan" icon={<Leaf size={20} color="#a7f3d0" />} />
      <StatLabel label="Weed Detected" />
      <StatValue value={value} subtext="This Scan" />
      <SparkLine color="#22c55e" width={110} height={22} points={[3, 8, 5, 11, 7, 14, 9, 16, 12, 18, 14, 20]} />
    </StatCardWrapper>
  )
}

// ── Card 2: Crops Detected ──
function CropCard({ index, value = 0 }: CardDataProps) {
  return (
    <StatCardWrapper index={index} accentColor="#22c55e">
      <StatHeader trend="+8% vs last scan" icon={<Sprout size={20} color="#a7f3d0" />} />
      <StatLabel label="Crops Detected" />
      <StatValue value={value} subtext="Healthy" />
      <SparkLine color="#22c55e" width={110} height={22} points={[5, 9, 8, 13, 10, 16, 12, 18, 15, 20, 17, 22]} />
    </StatCardWrapper>
  )
}

// ── Card 3: AI Confidence ──
function ConfidenceCard({ index, confidence = 92 }: CardDataProps) {
  return (
    <StatCardWrapper index={index} accentColor="#22c55e">
      <StatHeader trend="+5% vs last scan" icon={<Target size={20} color="#a7f3d0" />} />
      <StatLabel label="AI Confidence" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <StatValue value={`${Math.round(confidence)}%`} subtext="High Accuracy" />
        <div style={{ marginLeft: 'auto' }}>
          <RingProgress value={confidence} size={64} strokeWidth={6} color="#22c55e" />
        </div>
      </div>
    </StatCardWrapper>
  )
}

// ── Card 4: Risk Level ──
function RiskCard({ index, riskLevel = 'Medium' }: CardDataProps) {
  const barSegments = [
    { w: '35%', bg: '#22c55e' },
    { w: '30%', bg: '#22c55e' },
    { w: '20%', bg: '#facc15' },
    { w: '15%', bg: '#334155' },
  ]
  return (
    <StatCardWrapper index={index} accentColor="#22c55e">
      <StatHeader icon={<ShieldCheck size={20} color="#a7f3d0" />} />
      <StatLabel label="Risk Level" />
      <StatValue value={<span style={{ color: '#fff' }}>{riskLevel}</span>} subtext="Take action soon" />
      <div style={{ display: 'flex', gap: 3, borderRadius: 4, overflow: 'hidden', height: 8 }}>
        {barSegments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            style={{
              width: seg.w,
              height: '100%',
              background: seg.bg,
              borderRadius: 2,
              boxShadow: i === 1 ? `0 0 6px ${seg.bg}80` : 'none',
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>
    </StatCardWrapper>
  )
}

// ── Card 5: Humidity ──
function HumidityCard({ index, value = 65 }: CardDataProps) {
  return (
    <StatCardWrapper index={index} accentColor="#22c55e">
      <StatHeader icon={<Droplets size={20} color="#a7f3d0" />} />
      <StatLabel label="Humidity" />
      <StatValue value={`${value}%`} subtext="Optimal" />
      <WaveGraph color="#38bdf8" width={110} height={22} />
    </StatCardWrapper>
  )
}

// ── Wrapper ──
interface WrapperProps {
  children: React.ReactNode
  index: number
  accentColor?: string
  wide?: boolean
}

function StatCardWrapper({ children, index, accentColor = '#22c55e' }: WrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.08, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.28), 0 0 16px ${accentColor}2a` }}
      style={{
        flex: '0 1 190px',
        maxWidth: 190,
        minWidth: 190,
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        background: 'linear-gradient(180deg, rgba(7, 14, 14, 0.94) 0%, rgba(12, 20, 19, 0.88) 100%)',
        border: '1px solid rgba(34,197,94,0.16)',
        borderRadius: 28,
        padding: '16px',
        boxShadow: '0 20px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  )
}

interface StatsRowProps {
  metrics?: ScanMetrics
}

export function StatsRow({ metrics }: StatsRowProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 24,
      }}
    >
      <WeedCard index={0} value={metrics?.weeds ?? 23} />
      <CropCard index={1} value={metrics?.crops ?? 18} />
      <ConfidenceCard index={2} confidence={metrics?.avg_confidence ?? 92} />
      <RiskCard index={3} riskLevel={metrics?.risk_level ?? 'Medium'} />
      <HumidityCard index={4} value={metrics ? Math.round(metrics.crop_pct) : 65} />
    </div>
  )
}

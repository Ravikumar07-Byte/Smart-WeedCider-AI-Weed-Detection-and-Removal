import { motion } from 'framer-motion'
import { HeroScanOverlay } from './HeroScanOverlay'

export function HeroSection() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: 460,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 28,
      background: 'rgba(0, 0, 0, 0.18)',
      borderRadius: 32,
      border: '1px solid rgba(34,197,94,0.12)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(3, 26, 15, 0.82), rgba(5, 17, 8, 0.48) 45%, rgba(5, 17, 8, 0.00) 78%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <HeroScanOverlay />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          width: 'calc(100% - 48px)',
          maxWidth: 380,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)', color: '#d9f99d', fontSize: 12, fontWeight: 700 }}>
          AI SCAN ACTIVE
        </div>
        <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 24, background: 'rgba(0,0,0,0.54)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>Field status</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>23</div>
              <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.74)' }}>Weeds detected</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.16)', color: '#86efac', fontSize: 11, fontWeight: 700 }}>+12%</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

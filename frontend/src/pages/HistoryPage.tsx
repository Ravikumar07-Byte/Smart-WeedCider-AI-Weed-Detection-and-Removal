import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { HistoryEntry, SampleImage } from '../api'
import { getImageFallback } from '../api'

type HistoryPageProps = {
  history: HistoryEntry[]
  sampleImages: SampleImage[]
  onSelectSampleImage: (sample: SampleImage) => Promise<void>
  onClearHistory: () => Promise<void>
  loading: boolean
}

export function HistoryPage({ history, sampleImages, onSelectSampleImage, onClearHistory, loading }: HistoryPageProps) {
  const getHistoryThumb = (entry: HistoryEntry) => entry.result_thumb || entry.original_thumb || ''

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: 'clamp(22px, 3vw, 32px) clamp(18px, 4vw, 44px) clamp(28px, 4vw, 32px) clamp(24px, 5vw, 92px)' }}>
      <div style={{ display: 'grid', gap: 24 }}>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass glow-green-strong"
          style={{ padding: 28, borderRadius: 32 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Scan history</p>
              <h1 style={{ margin: '10px 0 0', color: '#fff', fontSize: 32 }}>Field history & sample gallery</h1>
            </div>
            <div style={{ minWidth: 220, textAlign: 'right', color: '#cbd5e1' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>History records</p>
              <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 13 }}>{history.length} scans recorded</p>
            </div>
          </div>
          <p style={{ marginTop: 18, color: '#cbd5e1', lineHeight: 1.8 }}>Browse past weed detection results, compare crop and weed counts, and tap any sample image to load it directly into the AI workspace.</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="glass glow-green-strong"
          style={{ padding: 28, borderRadius: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Curated sample images</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 24 }}>Load a sample field instantly</h2>
            </div>
            <span style={{ color: '#22c55e', fontSize: 12 }}>{loading ? 'Loading sample images…' : `${sampleImages.length} available`}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
            {sampleImages.length === 0 ? (
              <div className="glass glow-green-sm" style={{ padding: 24, borderRadius: 24, color: '#94a3b8' }}>
                No sample images available. Make sure backend is running and sample data exists.
              </div>
            ) : sampleImages.slice(0, 25).map((sample) => (
              <button
                key={sample.filename}
                type="button"
                onClick={() => onSelectSampleImage(sample)}
                disabled={loading}
                className="glass glow-green-sm"
                style={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: 24,
                  overflow: 'hidden',
                  padding: 0,
                  minHeight: 170,
                  display: 'grid',

                }}
              >
                <img
                  src={sample.url}
                  alt={sample.label}
                  onError={(event) => {
                    event.currentTarget.src = getImageFallback()
                  }}
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                />
                <div style={{ padding: '12px 14px', textAlign: 'left' }}>
                  <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sample.label}</p>
                  <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 12 }}>Tap to analyze</p>
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass glow-green-strong"
          style={{ padding: 28, borderRadius: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em' }}>History timeline</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 24 }}>Saved scan records</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#22c55e', fontSize: 12 }}>{loading ? 'Loading history...' : history.length ? 'Most recent first' : 'No history yet'}</span>
              {history.length > 0 && (
                <motion.button
                  onClick={onClearHistory}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={14} />
                  Clear History
                </motion.button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {loading && history.length === 0 ? (
              <div className="glass glow-green-sm" style={{ padding: 24, borderRadius: 24, color: '#94a3b8' }}>
                Loading saved scan records...
              </div>
            ) : history.length === 0 ? (
              <div className="glass glow-green-sm" style={{ padding: 24, borderRadius: 24, color: '#94a3b8' }}>
                Your scan history will appear here after the first detection.
              </div>
            ) : history.map((entry) => (
              <div
                key={entry.id}
                className="history-record-row"
                style={{
                  display: 'grid',
                  gap: 18,
                  padding: 18,
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.04)',
                  alignItems: 'center',
                }}
              >
                <img
                  src={getHistoryThumb(entry)}
                  alt={`Scan ${entry.id}`}
                  onError={(event) => {
                    event.currentTarget.src = getImageFallback()
                  }}
                  style={{ width: '100%', minHeight: 110, maxHeight: 110, objectFit: 'cover', borderRadius: 20 }}
                />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, color: '#fff', fontSize: 15, fontWeight: 700 }}>Scan {entry.id}</p>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{entry.time_ago}</span>
                  </div>
                  <p style={{ margin: '10px 0 0', color: '#cbd5e1', fontSize: 13 }}>File: {entry.filename}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, color: '#94a3b8', fontSize: 13 }}>
                    <span>{entry.crops} crops</span>
                    <span>{entry.weeds} weeds</span>
                    <span>{entry.confidence}% confidence</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                  <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>{entry.risk_level}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>History entry</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

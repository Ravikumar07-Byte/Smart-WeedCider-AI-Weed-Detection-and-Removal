import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Camera, Radar, Search, ShieldCheck, Upload } from 'lucide-react'
import type { ModelInfo, ScanResult, Stats } from '../api'
import { HeroScanOverlay } from '../components/hero/HeroScanOverlay'

type HomePageProps = {
  onImageUpload: (file: File) => Promise<void>
  onLiveDetection: () => void
  loading: boolean
  scanResult: ScanResult | null
  stats: Stats | null
  modelInfo: ModelInfo | null
}

export function HomePage({ onImageUpload, onLiveDetection, loading }: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMessage, setSearchMessage] = useState('Search sections like detection, history, crop health, reports')

  const searchTargets = useMemo(() => [
    { route: '/', label: 'Home', keywords: ['home', 'main', 'start', 'landing'] },
    { route: '/detection', label: 'Detection', keywords: ['detection', 'detect', 'scan', 'upload', 'image', 'camera', 'live'] },
    { route: '/dashboard', label: 'Dashboard', keywords: ['dashboard', 'stats', 'analytics', 'model', 'performance'] },
    { route: '/history', label: 'History', keywords: ['history', 'previous', 'saved', 'records', 'scans'] },
    { route: '/recommendations', label: 'Recommendations', keywords: ['recommendations', 'advice', 'actions', 'tips', 'treatment'] },
    { route: '/crop-health', label: 'Crop Health', keywords: ['crop', 'health', 'vigor', 'stress', 'yield'] },
    { route: '/project-overview', label: 'Project Overview', keywords: ['project', 'overview', 'about', 'info', 'details'] },
  ], [])

  const handleFileClick = () => fileInputRef.current?.click()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onImageUpload(file)
  }

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      setSearchMessage('Type a section name, then press Enter')
      return
    }

    const match = searchTargets.find((target) =>
      target.label.toLowerCase().includes(query) ||
      target.keywords.some((keyword) => keyword.includes(query) || query.includes(keyword)),
    )

    if (!match) {
      setSearchMessage('No match found. Try home, detection, dashboard, history, recommendations, crop health, or project overview')
      return
    }

    setSearchMessage(`Opening ${match.label}`)
    navigate(match.route)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
	      <div style={{
	        position: 'absolute',
	        inset: 0,
        backgroundImage: `linear-gradient(90deg, rgba(2, 8, 5, 0.92) 0%, rgba(2, 8, 5, 0.30) 40%, rgba(2, 8, 5, 0.00) 70%), url('/hero-cinematic.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
	        zIndex: 0,
	      }} />
	      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
	        <HeroScanOverlay />
	      </div>
	      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 32, padding: 'clamp(22px, 3vw, 30px) clamp(18px, 4vw, 40px) clamp(28px, 4vw, 40px) clamp(22px, 5vw, 56px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 'min(100%, 420px)', minWidth: 0, padding: '12px 18px', borderRadius: 999, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(34,197,94,0.18)', backdropFilter: 'blur(16px)' }}>
            <Search size={16} color='#a7f3d0' />
            <input
              placeholder='Search anything...'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: 13,
                lineHeight: 1.6,
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{
                padding: 0,
                border: 'none',
                background: 'transparent',
                color: '#86efac',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Go
            </button>
            </div>
            <span style={{ paddingLeft: 18, color: 'rgba(187,247,208,0.62)', fontSize: 10.5, letterSpacing: '0.04em' }}>
              {searchMessage}
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 40, alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520, position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, border: '1px solid rgba(34,197,94,0.28)', background: 'rgba(34,197,94,0.14)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ color: '#a7f3d0', fontSize: 11, fontWeight: 700 }}>AI-Powered Weed Detection</span>
              </div>

              <h1 style={{ color: '#ffffff', fontSize: 'clamp(2.4rem, 3.8vw, 3.6rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
                AI-Powered<br />
                <span style={{ color: '#22c55e' }}>Weed Detection</span><br />
                for Smarter Farming
              </h1>

              <p style={{ color: 'rgba(187,247,208,0.82)', fontSize: 15, lineHeight: 1.7, maxWidth: 620 }}>
                Detect weeds early, protect your crops, and increase your yield with the power of AI.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  onClick={handleFileClick}
                  disabled={loading}
                  className="cyber-action-btn cyber-action-btn-primary"
                >
                  <span className="cyber-action-icon"><Upload size={18} /></span>
                  <div>
                    <strong>Upload Image</strong>
                  </div>
                </button>

                <button
                  onClick={onLiveDetection}
                  disabled={loading}
                  className="cyber-action-btn cyber-action-btn-secondary"
                >
                  <span className="cyber-action-icon"><Camera size={18} /></span>
                  <div>
                    <strong>Live Detection</strong>
                  </div>
                </button>
              </div>

              <div className="assistant-lower-dock">
                <div className="assistant-hero-wrap" aria-hidden="true">
                  <span className="assistant-spiral-core" />
                  <img className="assistant-hero-img" src="/clock-assistant.png" alt="" />
                </div>

                <motion.div
                  className="assistant-info-card glass"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                >
                  <div className="assistant-card-scanline" />
                  <header>
                    <span>READY</span>
                    <strong>Guide</strong>
                  </header>
                  <div className="assistant-guide-steps">
                    <div>
                      <span><Upload size={12} /></span>
                      <strong>Upload</strong>
                    </div>
                    <div>
                      <span><Radar size={12} /></span>
                      <strong>Run AI Scan</strong>
                    </div>
                    <div>
                      <span><ShieldCheck size={12} /></span>
                      <strong>Review Report</strong>
                    </div>
                  </div>
                </motion.div>

              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </div>
  )
}

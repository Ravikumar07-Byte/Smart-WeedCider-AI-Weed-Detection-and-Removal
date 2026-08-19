import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar, type FarmerProfile } from './Sidebar'
import { HomePage } from '../../pages/HomePage'
import { ScanPage } from '../../pages/ScanPage'
import { HistoryPage } from '../../pages/HistoryPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { RecommendationsPage } from '../../pages/RecommendationsPage'
import { CropHealthPage } from '../../pages/CropHealthPage'
import { ProjectOverviewPage } from '../../pages/ProjectOverviewPage'
import {
  fetchHistory,
  fetchModelInfo,
  fetchSampleImages,
  fetchStats,
  resetMetrics,
  uploadImage,
} from '../../api'
import type { HistoryEntry, ModelInfo, SampleImage, ScanResult, Stats } from '../../api'

const DEFAULT_PROFILE: FarmerProfile = {
  id: 'default',
  name: 'Sumanth',
  role: 'Farmer',
}

const readStoredProfiles = (): FarmerProfile[] => {
  try {
    const raw = window.localStorage.getItem('weedicider.profiles')
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter((profile) => profile?.id && profile?.name)
        .map((profile) => ({
          id: String(profile.id),
          name: String(profile.name),
          role: String(profile.role || 'Farmer'),
        }))
    }
  } catch {
    // ignore invalid localStorage
  }
  return [DEFAULT_PROFILE]
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistoryState] = useState<HistoryEntry[]>([])
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [sampleImages, setSampleImages] = useState<SampleImage[]>([])
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingLive, setPendingLive] = useState(false)
  const [profiles, setProfiles] = useState<FarmerProfile[]>(readStoredProfiles)
  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      return window.localStorage.getItem('weedicider.activeProfile') || DEFAULT_PROFILE.id
    } catch {
      return DEFAULT_PROFILE.id
    }
  })
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')

  const activeNav = useMemo(() => {
    const path = location.pathname.split('/')[1]
    return path === '' ? 'home' : path
  }, [location.pathname])

  const activeProfile = useMemo(() => {
    return profiles.find((profile) => profile.id === activeProfileId) || profiles[0] || DEFAULT_PROFILE
  }, [activeProfileId, profiles])

  useEffect(() => {
    window.localStorage.setItem('weedicider.profiles', JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    window.localStorage.setItem('weedicider.activeProfile', activeProfile.id)
  }, [activeProfile.id])

  useEffect(() => {
    void loadStats()
    void loadHistory()
    void loadModelInfo()
    void loadSampleImages()
  }, [activeProfile.id])

  const loadStats = async () => {
    try {
      const data = await fetchStats(activeProfile.id)
      setStats(data)
    } catch {
      // ignore
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const data = await fetchHistory(activeProfile.id)
      setHistoryState(data)
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadModelInfo = async () => {
    try {
      const data = await fetchModelInfo()
      setModelInfo(data)
    } catch {
      // ignore
    }
  }

  const loadSampleImages = async () => {
    try {
      const data = await fetchSampleImages()
      setSampleImages(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load sample images. Ensure the backend is running and refresh the page.',
      )
      setSampleImages([])
    }
  }

  const handleNav = (id: string) => {
    setError(null)
    navigate(id === 'home' ? '/' : `/${id}`)
  }

  const handlePredict = async (file: File, options: { confidence: number; imgsz: number }) => {
    setLoading(true)
    setError(null)

    try {
      const data = await uploadImage(file, options.confidence, options.imgsz, activeProfile)
      setScanResult(data)
      void navigate('/detection')
      await loadHistory()
      await loadStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setPendingFile(file)
    setPendingLive(false)
    setScanResult(null)
    void navigate('/detection')
  }

  const handleSelectSampleImage = async (sample: SampleImage) => {
    setLoading(true)
    setError(null)

    try {
      let file: File
      try {
        const response = await fetch(sample.url)
        if (!response.ok) {
          throw new Error('Unable to load sample image')
        }
        const blob = await response.blob()
        file = new File([blob], sample.filename.split('/').pop() || sample.label, { type: blob.type || 'image/jpeg' })
      } catch {
        file = new File(['sample image fallback'], sample.filename.split('/').pop() || sample.label, { type: 'image/jpeg' })
      }

      const data = await uploadImage(file, 0.25, 640, activeProfile, sample.url)
      setScanResult(data)
      await loadHistory()
      await loadStats()
      navigate('/detection')
      setPendingFile(null)
      setPendingLive(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sample image scan failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLiveDetection = () => {
    setPendingFile(null)
    setPendingLive(true)
    setScanResult(null)
    setError(null)
    void navigate('/detection')
  }

  const handleClearScanResult = () => {
    setScanResult(null)
  }

  const clearPendingLaunch = () => {
    setPendingFile(null)
    setPendingLive(false)
  }

  const handleClearHistory = async () => {
    setHistoryLoading(true)
    try {
      const resetStats = await resetMetrics(activeProfile.id)
      setStats(resetStats)
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not clear history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRefreshDashboard = async () => {
    setError(null)
    setHistoryLoading(true)
    try {
      const resetStats = await resetMetrics(activeProfile.id)
      setStats(resetStats)
      setHistoryState([])
      setScanResult(null)
      await Promise.all([
        loadModelInfo(),
        loadSampleImages(),
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh dashboard')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId)
    setScanResult(null)
    setError(null)
    setProfileMenuOpen(false)
  }

  const openCreateProfile = () => {
    setNewProfileName('')
    setProfileModalOpen(true)
    setProfileMenuOpen(false)
  }

  const handleCreateProfile = () => {
    const name = newProfileName.trim()
    if (!name) return
    const profile: FarmerProfile = {
      id: `farmer-${Date.now()}`,
      name,
      role: 'Farmer',
    }
    setProfiles((current) => [...current, profile])
    setActiveProfileId(profile.id)
    setProfileModalOpen(false)
    setNewProfileName('')
    setScanResult(null)
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020602' }}>
      <Sidebar
        active={activeNav}
        onNav={handleNav}
        profiles={profiles}
        activeProfile={activeProfile}
        profileMenuOpen={profileMenuOpen}
        onToggleProfileMenu={() => setProfileMenuOpen((open) => !open)}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={openCreateProfile}
      />

      <div style={{ marginLeft: 72, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="page-scan-line" />
        </div>

        {error && (
          <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 30, maxWidth: 420, padding: '14px 18px', borderRadius: 22, background: 'rgba(30, 41, 59, 0.92)', border: '1px solid rgba(34,197,94,0.24)', color: '#f8fafc', boxShadow: '0 18px 48px rgba(0,0,0,0.35)' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Action required</p>
            <p style={{ marginTop: 8, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{error}</p>
          </div>
        )}

        {profileModalOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.52)' }}>
            <div className="glass glow-green-strong" style={{ width: 'min(420px, calc(100vw - 40px))', padding: 24, borderRadius: 24, background: 'rgba(4, 12, 6, 0.96)' }}>
              <p style={{ margin: 0, color: '#8ee5aa', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>New farmer profile</p>
              <h2 style={{ margin: '10px 0 0', color: '#fff', fontSize: 24 }}>Add farmer</h2>
              <p style={{ margin: '10px 0 0', color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                Scans, history, dashboard stats, crop health, and recommendations will be separated for the active farmer.
              </p>
              <input
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleCreateProfile()
                }}
                placeholder="Farmer name"
                autoFocus
                style={{
                  width: '100%',
                  marginTop: 18,
                  padding: '13px 14px',
                  borderRadius: 16,
                  border: '1px solid rgba(34,197,94,0.28)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  style={{ padding: '11px 15px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  style={{ padding: '11px 15px', borderRadius: 14, border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.18)', color: '#d1fae5', cursor: 'pointer', fontWeight: 800 }}
                >
                  Add farmer
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onImageUpload={handleImageUpload}
                  onLiveDetection={handleLiveDetection}
                  loading={loading}
                  scanResult={scanResult}
                  stats={stats}
                  modelInfo={modelInfo}
                />
              }
            />
            <Route
              path="/detection"
              element={
                <ScanPage
                  onPredict={handlePredict}
                  onClearResult={handleClearScanResult}
                  loading={loading}
                  scanResult={scanResult}
                  stats={stats}
                  initialFile={pendingFile}
                  initialLive={pendingLive}
                  onInitialReady={clearPendingLaunch}
                />
              }
            />
            <Route
              path="/history"
              element={
                <HistoryPage
                  history={history}
                  sampleImages={sampleImages}
                  onSelectSampleImage={handleSelectSampleImage}
                  onClearHistory={handleClearHistory}
                  loading={loading || historyLoading}
                />
              }
            />
            <Route path="/dashboard" element={<DashboardPage stats={stats} history={history} modelInfo={modelInfo} loading={loading || historyLoading} onRefresh={handleRefreshDashboard} />} />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="/recommendations" element={<RecommendationsPage history={history} loading={loading} profileId={activeProfile.id} />} />
            <Route path="/crop-health" element={<CropHealthPage history={history} loading={loading || historyLoading} profileId={activeProfile.id} />} />
            <Route path="/crop" element={<Navigate to="/crop-health" replace />} />
            <Route path="/project-overview" element={<ProjectOverviewPage stats={stats} history={history} modelInfo={modelInfo} />} />
            <Route path="/settings" element={<Navigate to="/project-overview" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

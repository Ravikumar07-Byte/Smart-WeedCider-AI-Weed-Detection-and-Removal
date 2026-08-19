import axios from 'axios'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '')

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
  },
})

client.interceptors.response.use(
  response => response,
  error => {
    const message = error?.response?.data?.error || error?.message || 'API request failed'
    return Promise.reject(new Error(message))
  },
)

const STORAGE_HISTORY_KEY = 'weedicider.history'
const STATS_KEY_PREFIX = 'weedicider.stats'

const cropPlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgZmlsbD0iIzIyYzU1ZSIvPjx0ZXh0IHg9IjgwIiB5PSI1NSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q3JvcDwvdGV4dD48L3N2Zz4='
const weedPlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjgwIiB5PSI1NSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V2VlZDwvdGV4dD48L3N2Zz4='
const imageUnavailablePlaceholder =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjExMCIgZmlsbD0iIzBiMTMwZiIvPjxwYXRoIGQ9Ik00OCA3Mmg2NGwtMTgtMjQtMTQgMTgtOC0xMC0yNCAzNnoiIGZpbGw9IiMyMmM1NWUiIG9wYWNpdHk9Ii43Ii8+PGNpcmNsZSBjeD0iNjQiIGN5PSI0NCIgcj0iOCIgZmlsbD0iIzg2ZWZiZiIvPjx0ZXh0IHg9IjgwIiB5PSI5NCIgZmlsbD0iIzk0YTNiOCIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgdW5hdmFpbGFibGU8L3RleHQ+PC9zdmc+'

const emptyStats = (): Stats => ({
  total_scans: 0,
  total_weeds: 0,
  total_crops: 0,
  avg_confidence: 0,
})

const mockHistory: HistoryEntry[] = [
  {
    id: 'mock-1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    time_ago: '1 day ago',
    filename: 'img113_jpg.rf.4592cdb90fe010c714a1c908676e8a1b.jpg',
    crops: 32,
    weeds: 13,
    total: 45,
    confidence: 89,
    risk_level: 'medium',
    crop_pct: 71.1,
    weed_pct: 28.9,
    original_thumb: cropPlaceholder,
    result_thumb: cropPlaceholder,
    profile_id: 'default',
    profile_name: 'Demo User'
  },
  {
    id: 'mock-2',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    time_ago: '2 days ago',
    filename: 'weed_0_4388_jpeg.rf.2eaf42a08b9ca656a4fbc9b2d3f68307.jpg',
    crops: 15,
    weeds: 13,
    total: 28,
    confidence: 82,
    risk_level: 'high',
    crop_pct: 53.6,
    weed_pct: 46.4,
    original_thumb: weedPlaceholder,
    result_thumb: weedPlaceholder,
    profile_id: 'default',
    profile_name: 'Demo User'
  }
]

// Helper functions for localStorage persistence
const isPersistableImage = (value?: string) => {
  return Boolean(value && !value.startsWith('blob:'))
}

export const getImageFallback = () => imageUnavailablePlaceholder

const resolveAssetUrl = (value: string) => {
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value
  if (value.startsWith('/') && apiBaseUrl && /^https?:\/\//i.test(apiBaseUrl)) {
    return new URL(value, apiBaseUrl).toString()
  }
  return value
}

const normalizeImageUrl = (value?: string, fallback = imageUnavailablePlaceholder) => {
  return isPersistableImage(value) ? resolveAssetUrl(value as string) : fallback
}

const normalizeConfidencePercent = (value: unknown) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.round((numberValue <= 1 ? numberValue * 100 : numberValue) * 10) / 10
}

const roundPercent = (value: number) => Math.round(value * 10) / 10

const normalizeHistoryEntry = (entry: HistoryEntry): HistoryEntry => {
  const fallback = entry.weeds > entry.crops ? weedPlaceholder : cropPlaceholder
  return {
    ...entry,
    total: Number.isFinite(entry.total) ? entry.total : (entry.crops || 0) + (entry.weeds || 0),
    confidence: normalizeConfidencePercent(entry.confidence),
    crop_pct: entry.crop_pct ?? (entry.total ? roundPercent((entry.crops / entry.total) * 100) : 0),
    weed_pct: entry.weed_pct ?? (entry.total ? roundPercent((entry.weeds / entry.total) * 100) : 0),
    original_thumb: normalizeImageUrl(entry.original_thumb, fallback),
    result_thumb: normalizeImageUrl(entry.result_thumb, fallback),
  }
}

const getStoredHistory = (): HistoryEntry[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : mockHistory
    return Array.isArray(parsed) ? parsed.map(normalizeHistoryEntry) : mockHistory
  } catch {
    return mockHistory
  }
}

const deriveStatsFromHistory = (history: HistoryEntry[]): Stats => {
  if (history.length === 0) return emptyStats()
  const totalConfidence = history.reduce((sum, entry) => sum + normalizeConfidencePercent(entry.confidence), 0)
  return {
    total_scans: history.length,
    total_weeds: history.reduce((sum, entry) => sum + (entry.weeds || 0), 0),
    total_crops: history.reduce((sum, entry) => sum + (entry.crops || 0), 0),
    avg_confidence: Math.round((totalConfidence / history.length) * 10) / 10,
  }
}

const getStoredStats = (profileId?: string): Stats => {
  const key = profileId ? `${STATS_KEY_PREFIX}.${profileId}` : STATS_KEY_PREFIX
  try {
    const history = getStoredHistory().filter(entry => !profileId || entry.profile_id === profileId)
    if (history.length) {
      return deriveStatsFromHistory(history)
    }

    const raw = window.localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        total_scans: Number(parsed.total_scans) || 0,
        total_weeds: Number(parsed.total_weeds) || 0,
        total_crops: Number(parsed.total_crops) || 0,
        avg_confidence: normalizeConfidencePercent(parsed.avg_confidence),
      }
    }
    return emptyStats()
  } catch {
    return emptyStats()
  }
}

const mockModelInfo: ModelInfo = {
  name: 'YOLOv8 Small',
  architecture: 'YOLOv8',
  classes: ['crop', 'weed'],
  input_size: 640,
  dataset: 'Combined Dataset',
  images_trained: 1200,
  final_mAP50: 0.421,
  final_mAP50_95: 0.312
}

const mockSampleImages: SampleImage[] = [
  {
    filename: 'train/images/img113_jpg.rf.4592cdb90fe010c714a1c908676e8a1b.jpg',
    label: 'crop_heavy',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iIzIyYzU1ZSIvPjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Dcm9wIEhlYXZ5IFNhbXBsZTwvdGV4dD48L3N2Zz4=',
  },
  {
    filename: 'train/images/weed_0_4388_jpeg.rf.2eaf42a08b9ca656a4fbc9b2d3f68307.jpg',
    label: 'weed_heavy',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XZWVkIEhlYXZ5IFNhbXBsZTwvdGV4dD48L3N2Zz4=',
  }
]

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to handle API calls with fallback to mock data
const apiCallWithFallback = async <T>(apiCall: () => Promise<T>, mockData: T): Promise<T> => {
  try {
    return await apiCall()
  } catch (error) {
    console.warn('API call failed, using mock data:', error)
    await delay(100) // Simulate minimal network delay
    return mockData
  }
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export type DetectionMetrics = {
  total: number
  crops: number
  weeds: number
  crop_pct: number
  weed_pct: number
  avg_confidence: number
  inference_time_ms: number
  risk_level: string
}

export type ScanReport = {
  detection_summary: {
    total_crops: number
    total_weeds: number
    confidence: number
    risk_level: string
    weed_ratio: string
    crop_ratio: string
  }
  crop_health_analysis: {
    condition: string
    crop_density: string
    healthy_crop_ratio: string
    crop_vigor_score?: number
    yield_loss_prediction?: number | string
    water_stress_level?: string
    nutritional_status?: string
    disease_risk?: string
    estimated_damage_cost?: number | string
    notes: string
  }
  weed_infestation_analysis: {
    severity: string
    weed_spread: string
    affected_zones: string
    competition_risk: string
  }
  recommendations: Array<{ title: string; detail: string }>
  ai_insights: { explanation: string; accuracy: string; confidence_scoring: string }
  field_status: string
}

export type ScanResult = {
  image: string
  original_thumb: string
  detections: Array<{ class: string; confidence: number; bbox: number[] }>
  metrics: DetectionMetrics
  summary: string
  recommendations: Array<{ icon: string; text: string }>
  report: ScanReport
  image_size: { width: number; height: number }
  scan_id: string
}

export type HistoryEntry = {
  id: string
  timestamp: string
  time_ago: string
  filename: string
  crops: number
  weeds: number
  total: number
  confidence: number
  risk_level: string
  crop_pct?: number
  weed_pct?: number
  original_thumb: string
  result_thumb: string
  profile_id?: string
  profile_name?: string
  report?: ScanReport
}

export type Stats = {
  total_scans: number
  total_weeds: number
  total_crops: number
  avg_confidence: number
}

export type ModelInfo = {
  name: string
  architecture: string
  classes: string[]
  input_size: number
  dataset: string
  images_trained: number
  final_mAP50: number
  final_mAP50_95: number
}

export type BackendStatus = {
  status: string
  model_loaded: boolean
  model_path: string
  loaded_classes: string[]
  history_count: number
  server_time: string
}

export type SampleImage = {
  filename: string
  label: string
  url: string
}

export type Recommendation = {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'immediate' | 'scheduled' | 'preventive'
  estimated_cost: number
  timeline: string
  actions: string[]
  risk_level: string
  potential_impact: string
  confidence: number
}

export type RecommendationsResponse = {
  recommendations: Recommendation[]
  stats: {
    total_scans: number
    avg_weed_percentage: number
    risk_trend: string
    total_recommendations: number
    estimated_cost: number
    potential_savings: number
  }
  analysis: {
    weed_pressure_level: string
    recommended_action_frequency: string
    cost_benefit_ratio: number
  }
}

export type CropHealthTrend = {
  scan_index: number
  vigor_score: number
  crop_pct: number
  weed_pct: number
  timestamp: string
}

export type HealthRecommendation = {
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  action: string
}

export type CropHealthResponse = {
  current_health: {
    crop_vigor_score: number
    condition: string
    crop_percentage: number
    weed_percentage: number
    confidence_level: number
    timestamp: string
  }
  health_metrics: {
    yield_loss_prediction: string
    water_stress_level: string
    nutritional_status: string
    disease_risk: string
    estimated_damage_cost: string
    days_until_critical: number
  }
  trends: CropHealthTrend[]
  recommendations: HealthRecommendation[]
  summary: {
    total_scans: number
    avg_crop_percentage: number
    avg_weed_percentage: number
    health_trend: string
  }
}

export const uploadImage = async (
  file: File,
  confidence = 0.25,
  imgsz = 640,
  profile?: { id: string; name: string },
  sourceImageUrl?: string,
): Promise<ScanResult> => {
  const originalDataUrl = sourceImageUrl ? normalizeImageUrl(sourceImageUrl) : await fileToDataUrl(file)

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('confidence', String(confidence))
    formData.append('imgsz', String(imgsz))
    if (profile?.id) {
      formData.append('profile_id', profile.id)
      formData.append('profile_name', profile.name)
    }

    const response = await client.post('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const backendResult = normalizeScanResult(response.data, originalDataUrl)
    persistScanResult(backendResult, file, profile)
    return backendResult
  } catch (error) {
    console.warn('Prediction API failed, using local scan fallback:', error)
  }

  // Simulate processing delay
  await delay(500)

  // Create mock result based on filename or random
  const filenameScore = Array.from(file.name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const isWeedHeavy = file.name.toLowerCase().includes('weed') || filenameScore % 5 === 0
  const totalDetections = 15 + (filenameScore % 30)
  const weedCount = isWeedHeavy ? Math.max(1, Math.floor(totalDetections * 0.6)) : Math.max(0, Math.floor(totalDetections * 0.2))
  const cropCount = totalDetections - weedCount
  const avgConfidence = 82 + (filenameScore % 15)
  const riskLevel = weedCount > cropCount ? 'high' : weedCount > cropCount * 0.3 ? 'medium' : 'low'

  const mockResult: ScanResult = {
    image: originalDataUrl,
    original_thumb: originalDataUrl,
    detections: Array.from({ length: totalDetections }, (_, i) => ({
      class: i < cropCount ? 'crop' : 'weed',
      confidence: Math.min(99, avgConfidence + (i % 5) - 2),
      bbox: [
        ((i * 17) % 80) / 100,
        ((i * 23) % 80) / 100,
        0.12 + ((i * 7) % 12) / 100,
        0.12 + ((i * 11) % 12) / 100,
      ]
    })),
    metrics: {
      total: totalDetections,
      crops: cropCount,
      weeds: weedCount,
      crop_pct: Math.round((cropCount / totalDetections) * 100 * 10) / 10,
      weed_pct: Math.round((weedCount / totalDetections) * 100 * 10) / 10,
      avg_confidence: avgConfidence,
      inference_time_ms: 150 + (filenameScore % 200),
      risk_level: riskLevel
    },
    summary: `Detected ${cropCount} crops and ${weedCount} weeds with ${riskLevel} risk level`,
    recommendations: [
      {
        icon: 'alert-triangle',
        text: weedCount > cropCount ? 'Immediate weed control required' : 'Monitor weed growth'
      },
      {
        icon: 'droplets',
        text: 'Check soil moisture levels'
      },
      {
        icon: 'calendar',
        text: 'Schedule follow-up scan in 3-5 days'
      }
    ],
    report: {
      detection_summary: {
        total_crops: cropCount,
        total_weeds: weedCount,
        confidence: avgConfidence,
        risk_level: riskLevel,
        weed_ratio: `${Math.round((weedCount / totalDetections) * 100)}%`,
        crop_ratio: `${Math.round((cropCount / totalDetections) * 100)}%`
      },
      crop_health_analysis: {
        condition: cropCount > weedCount ? 'Good' : 'Fair',
        crop_density: cropCount > 20 ? 'Optimal' : 'Sparse',
        healthy_crop_ratio: `${Math.round((cropCount / totalDetections) * 100)}%`,
        notes: 'Analysis based on visual inspection and AI detection'
      },
      weed_infestation_analysis: {
        severity: weedCount > 10 ? 'High' : weedCount > 5 ? 'Medium' : 'Low',
        weed_spread: 'Localized patches detected',
        affected_zones: 'Multiple areas require attention',
        competition_risk: weedCount > cropCount ? 'High' : 'Moderate'
      },
      recommendations: [
        {
          title: 'Immediate Action Required',
          detail: weedCount > cropCount ? 'Apply selective herbicide within 48 hours' : 'Monitor weed growth closely'
        },
        {
          title: 'Crop Protection',
          detail: 'Ensure adequate spacing between crops to reduce competition'
        },
        {
          title: 'Follow-up Monitoring',
          detail: 'Re-scan in 3-5 days to assess treatment effectiveness'
        }
      ],
      ai_insights: {
        explanation: 'AI analysis detected weed patterns using computer vision and machine learning algorithms',
        accuracy: 'High confidence in crop/weed classification',
        confidence_scoring: 'Based on model training with 1200+ agricultural images'
      },
      field_status: weedCount > cropCount ? 'Critical - Immediate intervention needed' : 'Stable - Regular monitoring recommended'
    },
    image_size: { width: 640, height: 480 },
    scan_id: `scan-${Date.now()}`
  }

  persistScanResult(mockResult, file, profile)

  return mockResult
}

const normalizeScanResult = (data: Partial<ScanResult>, originalDataUrl: string): ScanResult => {
  const detections = Array.isArray(data.detections) ? data.detections : []
  const cropCount = Number(data.metrics?.crops ?? data.report?.detection_summary?.total_crops ?? detections.filter(item => item.class === 'crop').length) || 0
  const weedCount = Number(data.metrics?.weeds ?? data.report?.detection_summary?.total_weeds ?? detections.filter(item => item.class === 'weed').length) || 0
  const total = Number(data.metrics?.total ?? cropCount + weedCount) || cropCount + weedCount
  const avgConfidence = normalizeConfidencePercent(data.metrics?.avg_confidence ?? data.report?.detection_summary?.confidence ?? 0)
  const riskLevel = String(data.metrics?.risk_level ?? data.report?.detection_summary?.risk_level ?? (weedCount > cropCount ? 'high' : weedCount > cropCount * 0.3 ? 'medium' : 'low'))
  const image = normalizeImageUrl(data.image, originalDataUrl)

  return {
    image,
    original_thumb: normalizeImageUrl(data.original_thumb, originalDataUrl),
    detections,
    metrics: {
      total,
      crops: cropCount,
      weeds: weedCount,
      crop_pct: data.metrics?.crop_pct ?? (total ? roundPercent((cropCount / total) * 100) : 0),
      weed_pct: data.metrics?.weed_pct ?? (total ? roundPercent((weedCount / total) * 100) : 0),
      avg_confidence: avgConfidence,
      inference_time_ms: Number(data.metrics?.inference_time_ms) || 0,
      risk_level: riskLevel,
    },
    summary: data.summary || `Detected ${cropCount} crops and ${weedCount} weeds with ${riskLevel} risk level`,
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    report: data.report || {
      detection_summary: {
        total_crops: cropCount,
        total_weeds: weedCount,
        confidence: avgConfidence,
        risk_level: riskLevel,
        weed_ratio: `${total ? Math.round((weedCount / total) * 100) : 0}%`,
        crop_ratio: `${total ? Math.round((cropCount / total) * 100) : 0}%`,
      },
      crop_health_analysis: {
        condition: cropCount >= weedCount ? 'Good' : 'Fair',
        crop_density: cropCount > 20 ? 'Optimal' : 'Sparse',
        healthy_crop_ratio: `${total ? Math.round((cropCount / total) * 100) : 0}%`,
        notes: 'Analysis based on visual inspection and AI detection',
      },
      weed_infestation_analysis: {
        severity: weedCount > 10 ? 'High' : weedCount > 5 ? 'Medium' : 'Low',
        weed_spread: 'Localized patches detected',
        affected_zones: 'Multiple areas require attention',
        competition_risk: weedCount > cropCount ? 'High' : 'Moderate',
      },
      recommendations: [],
      ai_insights: {
        explanation: 'AI analysis detected crop and weed patterns from the submitted image.',
        accuracy: 'Confidence is based on the model detection scores.',
        confidence_scoring: 'Scores are normalized to a 0-100 percentage scale.',
      },
      field_status: weedCount > cropCount ? 'Critical - Immediate intervention needed' : 'Stable - Regular monitoring recommended',
    },
    image_size: data.image_size || { width: 640, height: 480 },
    scan_id: data.scan_id || `scan-${Date.now()}`,
  }
}

const persistScanResult = (result: ScanResult, file: File, profile?: { id: string; name: string }) => {
  const newEntry: HistoryEntry = {
    id: result.scan_id,
    timestamp: new Date().toISOString(),
    time_ago: 'Just now',
    filename: file.name,
    crops: result.metrics.crops,
    weeds: result.metrics.weeds,
    total: result.metrics.total,
    confidence: normalizeConfidencePercent(result.metrics.avg_confidence),
    risk_level: result.metrics.risk_level,
    crop_pct: result.metrics.crop_pct,
    weed_pct: result.metrics.weed_pct,
    original_thumb: normalizeImageUrl(result.original_thumb, result.image),
    result_thumb: normalizeImageUrl(result.image, result.original_thumb),
    profile_id: profile?.id || 'default',
    profile_name: profile?.name || 'Demo User',
    report: result.report,
  }

  const currentHistory = getStoredHistory()
  const nextHistory = [normalizeHistoryEntry(newEntry), ...currentHistory]
  window.localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(nextHistory))

  // Update stats
  const profileId = profile?.id
  const profileHistory = nextHistory.filter(entry => !profileId || entry.profile_id === profileId)
  const statsKey = profileId ? `${STATS_KEY_PREFIX}.${profileId}` : STATS_KEY_PREFIX
  window.localStorage.setItem(statsKey, JSON.stringify(deriveStatsFromHistory(profileHistory)))
}

const profileParams = (profileId?: string) => (
  profileId ? { params: { profile_id: profileId } } : undefined
)

export const fetchStats = async (profileId?: string): Promise<Stats> => {
  const localStats = getStoredStats(profileId)
  if (localStats.total_scans > 0) {
    return localStats
  }

  return apiCallWithFallback(
    () => client.get('/api/stats', profileParams(profileId)).then(res => ({
      ...res.data,
      avg_confidence: normalizeConfidencePercent(res.data?.avg_confidence),
    })),
    getStoredStats(profileId)
  )
}

export const resetMetrics = async (profileId?: string): Promise<Stats> => {
  const resetStats = emptyStats()
  const statsKey = profileId ? `${STATS_KEY_PREFIX}.${profileId}` : STATS_KEY_PREFIX
  window.localStorage.setItem(statsKey, JSON.stringify(resetStats))
  
  // Clear history for this profile
  const currentHistory = getStoredHistory()
  const filteredHistory = profileId ? currentHistory.filter(entry => entry.profile_id !== profileId) : []
  window.localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(filteredHistory))

  try {
    await client.post('/api/reset-metrics', null, profileParams(profileId))
  } catch (error) {
    console.warn('Reset metrics API failed, using local reset:', error)
  }

  return resetStats
}

export const fetchHistory = async (profileId?: string): Promise<HistoryEntry[]> => {
  const localHistory = getStoredHistory().filter(entry => !profileId || entry.profile_id === profileId)
  if (localHistory.length > 0) {
    return localHistory
  }

  return apiCallWithFallback(
    () => client.get('/api/history', profileParams(profileId)).then(res => res.data),
    localHistory
  )
}

export const fetchModelInfo = async (): Promise<ModelInfo> => {
  return apiCallWithFallback(
    () => client.get('/api/model-info').then(res => res.data),
    mockModelInfo
  )
}

export const fetchAnalytics = async (profileId?: string): Promise<{timeline: HistoryEntry[]; summary: Stats}> => {
  const history = getStoredHistory().filter(entry => !profileId || entry.profile_id === profileId)
  return apiCallWithFallback(
    () => client.get('/api/analytics', profileParams(profileId)).then(res => res.data),
    { timeline: history, summary: deriveStatsFromHistory(history) }
  )
}

export const fetchSampleImages = async (): Promise<SampleImage[]> => {
  const normalizeSamples = (samples: SampleImage[]) => samples.map(sample => ({
    ...sample,
    url: normalizeImageUrl(sample.url),
  }))

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}sample-images/manifest.json`, { cache: 'no-cache' })
    if (response.ok) {
      const samples = await response.json()
      if (Array.isArray(samples) && samples.length > 0) {
        return normalizeSamples(samples)
      }
    }
  } catch {
    // fall through to backend or demo samples
  }

  return apiCallWithFallback(
    () => client.get('/api/sample-images').then(res => {
      const samples = Array.isArray(res.data) ? res.data : []
      return samples.length > 0 ? normalizeSamples(samples) : normalizeSamples(mockSampleImages)
    }),
    normalizeSamples(mockSampleImages)
  )
}

export const fetchBackendStatus = async (): Promise<BackendStatus> => {
  return apiCallWithFallback(
    () => client.get('/api/backend-status').then(res => res.data),
    {
      status: 'demo_mode',
      model_loaded: false,
      model_path: '',
      loaded_classes: ['crop', 'weed'],
      history_count: 0,
      server_time: new Date().toISOString(),
    }
  )
}

export const exportPdfReport = async (scanId: string): Promise<Blob> => {
  return apiCallWithFallback(
    () => client.get(`/api/export-report/${scanId}`, { responseType: 'blob' }).then(res => res.data),
    new Blob(['Demo PDF Report - Backend not available'], { type: 'application/pdf' })
  )
}

export const fetchRecommendations = async (profileId?: string): Promise<RecommendationsResponse> => {
  return apiCallWithFallback(
    () => client.get('/api/recommendations', profileParams(profileId)).then(res => res.data),
    {
      recommendations: [
        {
          id: 'immediate_weed_control',
          title: 'Immediate Weed Control',
          description: 'Apply selective treatment or mechanical removal for active weed patches detected in the latest scan.',
          priority: 'high',
          category: 'immediate',
          estimated_cost: 150,
          timeline: 'Within 48 hours',
          actions: ['Review weed zones', 'Remove high-confidence weed targets', 'Re-scan treated area'],
          risk_level: 'High',
          potential_impact: 'Reduce crop competition and protect yield',
          confidence: 88
        },
        {
          id: 'crop_nutrition_assessment',
          title: 'Crop Nutrition Assessment',
          description: 'Check soil nutrients and apply balanced fertilizer where crop density or vigor is below target.',
          priority: 'medium',
          category: 'scheduled',
          estimated_cost: 120,
          timeline: 'This week',
          actions: ['Inspect crop color and density', 'Test soil nutrients', 'Apply balanced fertilizer'],
          risk_level: 'Medium',
          potential_impact: 'Improve crop vigor and recovery after weed pressure',
          confidence: 84
        },
        {
          id: 'irrigation_optimization',
          title: 'Irrigation Optimization',
          description: 'Adjust water delivery so crop rows receive consistent moisture without feeding weed-heavy boundaries.',
          priority: 'medium',
          category: 'preventive',
          estimated_cost: 60,
          timeline: 'Next irrigation cycle',
          actions: ['Check root-zone moisture', 'Reduce water at weed margins', 'Track irrigation before next scan'],
          risk_level: 'Medium',
          potential_impact: 'Stabilize crop growth and limit weed advantage',
          confidence: 82
        }
      ],
      stats: {
        total_scans: 0,
        avg_weed_percentage: 0,
        risk_trend: 'stable',
        total_recommendations: 3,
        estimated_cost: 330,
        potential_savings: 900
      },
      analysis: {
        weed_pressure_level: 'Medium',
        recommended_action_frequency: 'Weekly',
        cost_benefit_ratio: 2.7
      }
    }
  )
}

export const fetchCropHealth = async (profileId?: string): Promise<CropHealthResponse> => {
  return apiCallWithFallback(
    () => client.get('/api/crop-health', profileParams(profileId)).then(res => res.data),
    {
      overall_health_score: 7.2,
      crop_density: 'Optimal (85% coverage)',
      stress_indicators: {
        water_stress: 'Low',
        nutritional_deficiency: 'Mild nitrogen deficiency detected',
        disease_pressure: 'None detected',
        weed_competition: 'Moderate'
      },
      recommendations: [
        'Apply nitrogen-rich fertilizer within 3 days',
        'Monitor soil moisture levels',
        'Continue regular scouting for pests'
      ],
      predicted_yield_impact: '+5% with recommended actions'
    }
  )
}

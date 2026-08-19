import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Droplets, Heart, Leaf, Microscope, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import type { HistoryEntry, CropHealthResponse } from '../api'
import { fetchCropHealth } from '../api'

type CropHealthPageProps = {
  history: HistoryEntry[]
  loading: boolean
  profileId?: string
}

export function CropHealthPage({ history, loading, profileId }: CropHealthPageProps) {
  const [healthData, setHealthData] = useState<CropHealthResponse | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadCropHealth = async () => {
      setApiLoading(true)
      try {
        const data = await fetchCropHealth(profileId)
        if (!cancelled) {
          setHealthData(normalizeCropHealthData(data, history))
        }
      } catch (error) {
        console.error('Failed to fetch crop health data:', error)
        if (!cancelled) {
          setHealthData(history.length > 0 ? buildCropHealthFromHistory(history) : null)
        }
      } finally {
        if (!cancelled) {
          setApiLoading(false)
        }
      }
    }

    loadCropHealth()

    return () => {
      cancelled = true
    }
  }, [history, profileId])

  const getVigorColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#eab308'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  const getVigorLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle size={20} color="#ef4444" />
      case 'warning':
        return <AlertTriangle size={20} color="#f97316" />
      default:
        return <Activity size={20} color="#22c55e" />
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'improving' ? (
      <TrendingUp size={24} color="#22c55e" />
    ) : trend === 'declining' ? (
      <TrendingDown size={24} color="#ef4444" />
    ) : (
      <Activity size={24} color="#f59e0b" />
    )
  }

  if (loading || apiLoading) {
    return (
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
        <div className="glass" style={{ padding: 28, borderRadius: 32 }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            Loading crop health analysis...
          </div>
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
        <div className="glass" style={{ padding: 28, borderRadius: 32 }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            No crop health data available. Upload scan images to analyze crop health.
          </div>
        </div>
      </div>
    )
  }

  const current = healthData.current_health
  const metrics = healthData.health_metrics
  const summary = healthData.summary
  const latestScan = history[0]
  const latestCropPct = latestScan ? percentFromEntry(latestScan, 'crops') : current.crop_percentage
  const latestWeedPct = latestScan ? percentFromEntry(latestScan, 'weeds') : current.weed_percentage

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 32, marginBottom: 8 }}>Crop Health Analysis</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16 }}>
            Synced from your latest scan history: crop coverage, weed pressure, confidence, trend, and recommended action.
          </p>
        </div>

        {latestScan && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass"
            style={{
              marginBottom: 24,
              padding: 20,
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(34,197,94,0.11), rgba(8,16,10,0.72))',
              border: '1px solid rgba(34,197,94,0.18)',
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 0.8fr) minmax(260px, 1.4fr)',
              gap: 18,
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest scan source</p>
              <p style={{ margin: '8px 0 0', color: '#f8fafc', fontSize: 18, fontWeight: 800 }}>{latestScan.filename}</p>
              <p style={{ margin: '6px 0 0', color: '#a7f3d0', fontSize: 12 }}>{latestScan.time_ago || latestScan.timestamp}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
              <SummaryMetric label="Crops" value={String(latestScan.crops)} color="#22c55e" />
              <SummaryMetric label="Weeds" value={String(latestScan.weeds)} color={latestScan.weeds > 0 ? '#f97316' : '#22c55e'} />
              <SummaryMetric label="Crop Cover" value={`${latestCropPct}%`} color="#22c55e" />
              <SummaryMetric label="Weed Pressure" value={`${latestWeedPct}%`} color={latestWeedPct > 30 ? '#ef4444' : '#f59e0b'} />
            </div>
          </motion.div>
        )}

        {/* Crop Vigor Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass glow-green-sm"
          style={{
            padding: 32,
            borderRadius: 32,
            background: 'rgba(8, 16, 10, 0.7)',
            border: '2px solid rgba(34,197,94,0.3)',
            marginBottom: 28,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          {/* Left: Vigor Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <svg
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(148,163,184,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={getVigorColor(current.crop_vigor_score)}
                  strokeWidth="8"
                  strokeDasharray={`${(current.crop_vigor_score / 100) * 565} 565`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 900, color: getVigorColor(current.crop_vigor_score) }}>
                  {current.crop_vigor_score}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Vigor Score</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#fff' }}>
                {getVigorLabel(current.crop_vigor_score)}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#94a3b8' }}>Crop Health Status</p>
            </div>
          </div>

          {/* Right: Current Metrics */}
          <div style={{ display: 'grid', gap: 16 }}>
            <MetricRow
              label="Field Condition"
              value={current.condition}
              icon={<Heart size={18} color="#22c55e" />}
              color={
                current.condition === 'Healthy'
                  ? '#22c55e'
                  : current.condition === 'Stable'
                    ? '#f59e0b'
                    : '#ef4444'
              }
            />
            <MetricRow
              label="Crop Percentage"
              value={`${formatPercent(current.crop_percentage)}%`}
              icon={<Leaf size={18} color="#22c55e" />}
              color="#22c55e"
            />
            <MetricRow
              label="Weed Percentage"
              value={`${formatPercent(current.weed_percentage)}%`}
              icon={<AlertTriangle size={18} color="#ef4444" />}
              color={current.weed_percentage > 40 ? '#ef4444' : '#f59e0b'}
            />
            <MetricRow
              label="Detection Confidence"
              value={`${formatPercent(toPercent(current.confidence_level))}%`}
              icon={<Zap size={18} color="#3b82f6" />}
              color="#3b82f6"
            />
          </div>
        </motion.div>

        {/* Health Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <HealthMetricCard
            title="Yield Loss Prediction"
            value={metrics.yield_loss_prediction}
            icon={<TrendingDown size={24} />}
            color={
              parseInt(metrics.yield_loss_prediction) > 50
                ? '#ef4444'
                : parseInt(metrics.yield_loss_prediction) > 25
                  ? '#f97316'
                  : '#22c55e'
            }
            description="Estimated crop yield reduction"
          />
          <HealthMetricCard
            title="Water Stress Level"
            value={metrics.water_stress_level}
            icon={<Droplets size={24} />}
            color={
              metrics.water_stress_level === 'High'
                ? '#ef4444'
                : metrics.water_stress_level === 'Moderate'
                  ? '#f97316'
                  : '#22c55e'
            }
            description="Irrigation requirement indicator"
          />
          <HealthMetricCard
            title="Nutritional Status"
            value={metrics.nutritional_status}
            icon={<Leaf size={24} />}
            color={
              metrics.nutritional_status === 'Excellent'
                ? '#22c55e'
                : metrics.nutritional_status === 'Good'
                  ? '#eab308'
                  : metrics.nutritional_status === 'Fair'
                    ? '#f97316'
                    : '#ef4444'
            }
            description="Soil fertility assessment"
          />
          <HealthMetricCard
            title="Disease Risk"
            value={metrics.disease_risk}
            icon={<Microscope size={24} />}
            color={
              metrics.disease_risk === 'Low'
                ? '#22c55e'
                : metrics.disease_risk === 'Moderate'
                  ? '#f97316'
                  : '#ef4444'
            }
            description="Pathogen pressure likelihood"
          />
          <HealthMetricCard
            title="Damage Cost"
            value={metrics.estimated_damage_cost}
            icon={<AlertTriangle size={24} />}
            color={parseInt(metrics.estimated_damage_cost) > 500 ? '#ef4444' : '#f59e0b'}
            description="Estimated economic loss"
          />
          <HealthMetricCard
            title="Days Until Critical"
            value={`${metrics.days_until_critical} days`}
            icon={<Activity size={24} />}
            color={metrics.days_until_critical < 7 ? '#ef4444' : '#f59e0b'}
            description="Time before intervention needed"
          />
        </motion.div>

        {/* Health Trend Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass glow-green-sm"
            style={{
              padding: 24,
              borderRadius: 28,
              background: 'rgba(8, 16, 10, 0.7)',
              border: '1px solid rgba(34,197,94,0.16)',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {getTrendIcon(summary.health_trend)}
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 600 }}>
                  Overall Health Trend: {summary.health_trend.charAt(0).toUpperCase() + summary.health_trend.slice(1)}
                </p>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Based on {summary.total_scans} scans</p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <SummaryMetric
                label="Avg Crop %"
                value={`${formatPercent(summary.avg_crop_percentage)}%`}
                color="#22c55e"
              />
              <SummaryMetric
                label="Avg Weed %"
                value={`${formatPercent(summary.avg_weed_percentage)}%`}
                color={summary.avg_weed_percentage > 30 ? '#ef4444' : '#f59e0b'}
              />
            </div>
          </motion.div>
        )}

        {/* Health Alerts & Recommendations */}
        {healthData.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginBottom: 28 }}
          >
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Health Alerts & Recommendations
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {healthData.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="glass"
                  style={{
                    padding: 16,
                    borderRadius: 20,
                    background:
                      rec.type === 'critical'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : rec.type === 'warning'
                          ? 'rgba(249, 115, 22, 0.1)'
                          : 'rgba(34, 197, 94, 0.1)',
                    border:
                      rec.type === 'critical'
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : rec.type === 'warning'
                          ? '1px solid rgba(249, 115, 22, 0.3)'
                          : '1px solid rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {getStatusIcon(rec.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        color:
                          rec.type === 'critical'
                            ? '#ef4444'
                            : rec.type === 'warning'
                              ? '#f97316'
                              : '#22c55e',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {rec.title}
                    </p>
                    <p style={{ margin: '6px 0 0', color: '#d1fae5', fontSize: 13 }}>
                      {rec.description}
                    </p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        color: '#a7f3d0',
                        fontSize: 12,
                        fontStyle: 'italic',
                      }}
                    >
                      Action: {rec.action}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Crop Health Trends Chart */}
        {healthData.trends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass glow-green-sm"
            style={{
              padding: 24,
              borderRadius: 28,
              background: 'rgba(8, 16, 10, 0.7)',
              border: '1px solid rgba(34,197,94,0.16)',
            }}
          >
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Vigor Score Trend (Last {healthData.trends.length} Scans)
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                height: 200,
                gap: 8,
              }}
            >
              {healthData.trends.map((trend, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  style={{
                    flex: 1,
                    height: `${Math.max(10, (trend.vigor_score / 100) * 100)}%`,
                    background: `linear-gradient(180deg, ${getVigorColor(trend.vigor_score)} 0%, ${getVigorColor(
                      trend.vigor_score,
                    )}40 100%)`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    position: 'relative',
                    transformOrigin: 'bottom',
                  }}
                  title={`Scan ${idx + 1}: Vigor ${trend.vigor_score} | Crop ${trend.crop_pct}% | Weed ${trend.weed_pct}%`}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trend.vigor_score}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
              <span>Oldest</span>
              <span>Most Recent</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,%]/g, ''))
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const toPercent = (value: number) => (value > 1 ? value : value * 100)

const formatPercent = (value: number) => {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(Math.round(rounded)) : String(rounded)
}

const percentFromEntry = (entry: HistoryEntry, key: 'crops' | 'weeds') => {
  const directValue = key === 'crops' ? entry.crop_pct : entry.weed_pct
  if (typeof directValue === 'number') return Math.round(directValue)
  const reportValue = key === 'crops'
    ? entry.report?.detection_summary.crop_ratio
    : entry.report?.detection_summary.weed_ratio
  if (reportValue) return Math.round(toNumber(reportValue))
  if (entry.total > 0) return Math.round((entry[key] / entry.total) * 100)
  return key === 'crops' ? Math.round(entry.confidence) : 0
}

function normalizeCropHealthData(data: CropHealthResponse, history: HistoryEntry[]): CropHealthResponse | null {
  if (!data?.current_health || Object.keys(data.current_health).length === 0 || !data.health_metrics) {
    return history.length > 0 ? buildCropHealthFromHistory(history) : null
  }

  const current = data.current_health
  const metrics = data.health_metrics
  const latest = history[0]
  const reportHealth = latest?.report?.crop_health_analysis
  const fallback: CropHealthResponse = history.length > 0 ? buildCropHealthFromHistory(history) : {
    current_health: {
      crop_vigor_score: clampScore(toNumber(current.crop_vigor_score)),
      condition: current.condition || 'Stable',
      crop_percentage: toNumber(current.crop_percentage),
      weed_percentage: toNumber(current.weed_percentage),
      confidence_level: (current.confidence_level ?? 0) > 1 ? (current.confidence_level ?? 0) / 100 : (current.confidence_level ?? 0),
      timestamp: current.timestamp || '',
    },
    health_metrics: {
      yield_loss_prediction: metrics.yield_loss_prediction || '0%',
      water_stress_level: metrics.water_stress_level || 'Low',
      nutritional_status: metrics.nutritional_status || 'Good',
      disease_risk: metrics.disease_risk || 'Low',
      estimated_damage_cost: metrics.estimated_damage_cost || '$0',
      days_until_critical: metrics.days_until_critical || 14,
    },
    trends: data.trends || [],
    recommendations: data.recommendations || [],
    summary: data.summary || {
      total_scans: data.trends?.length || 1,
      avg_crop_percentage: toNumber(current.crop_percentage),
      avg_weed_percentage: toNumber(current.weed_percentage),
      health_trend: 'stable',
    },
  }
  const confidenceLevel = current.confidence_level ?? fallback.current_health.confidence_level
  const normalizedConfidence = confidenceLevel > 1 ? confidenceLevel / 100 : confidenceLevel
  const cropPercentage = toNumber(current.crop_percentage, fallback.current_health.crop_percentage)
  const weedPercentage = toNumber(current.weed_percentage, fallback.current_health.weed_percentage)
  const reportVigor = reportHealth?.crop_vigor_score
  const vigorScore = clampScore(toNumber(reportVigor, current.crop_vigor_score || fallback.current_health.crop_vigor_score))

  return {
    current_health: {
      crop_vigor_score: vigorScore,
      condition: current.condition || reportHealth?.condition || fallback.current_health.condition,
      crop_percentage: cropPercentage,
      weed_percentage: weedPercentage,
      confidence_level: normalizedConfidence,
      timestamp: current.timestamp || fallback.current_health.timestamp,
    },
    health_metrics: {
      yield_loss_prediction: data.health_metrics.yield_loss_prediction || `${reportHealth?.yield_loss_prediction ?? toNumber(fallback.health_metrics.yield_loss_prediction)}%`,
      water_stress_level: data.health_metrics.water_stress_level || reportHealth?.water_stress_level || fallback.health_metrics.water_stress_level,
      nutritional_status: data.health_metrics.nutritional_status || reportHealth?.nutritional_status || fallback.health_metrics.nutritional_status,
      disease_risk: data.health_metrics.disease_risk || reportHealth?.disease_risk || fallback.health_metrics.disease_risk,
      estimated_damage_cost: data.health_metrics.estimated_damage_cost || `$${reportHealth?.estimated_damage_cost ?? toNumber(fallback.health_metrics.estimated_damage_cost)}`,
      days_until_critical: data.health_metrics.days_until_critical || fallback.health_metrics.days_until_critical,
    },
    trends: data.trends?.length ? data.trends.map((trend, index) => ({
      ...trend,
      scan_index: trend.scan_index || index + 1,
      vigor_score: clampScore(trend.vigor_score),
      crop_pct: toNumber(trend.crop_pct),
      weed_pct: toNumber(trend.weed_pct),
    })) : fallback.trends,
    recommendations: data.recommendations?.length ? data.recommendations : fallback.recommendations,
    summary: data.summary || fallback.summary,
  }
}

function buildCropHealthFromHistory(history: HistoryEntry[]): CropHealthResponse {
  const latest = history[0]
  const reportHealth = latest.report?.crop_health_analysis
  const reportWeed = latest.report?.weed_infestation_analysis
  const cropPercentage = percentFromEntry(latest, 'crops')
  const weedPercentage = percentFromEntry(latest, 'weeds')
  const confidence = latest.confidence > 1 ? latest.confidence / 100 : latest.confidence
  const vigorScore = clampScore(toNumber(reportHealth?.crop_vigor_score, cropPercentage * 0.7 + confidence * 30 - weedPercentage * 0.25))
  const avgCropPercentage = Math.round(history.reduce((sum, entry) => sum + percentFromEntry(entry, 'crops'), 0) / history.length)
  const avgWeedPercentage = Math.round(history.reduce((sum, entry) => sum + percentFromEntry(entry, 'weeds'), 0) / history.length)
  const condition = reportHealth?.condition || (vigorScore >= 80 ? 'Healthy' : vigorScore >= 60 ? 'Stable' : vigorScore >= 40 ? 'Stressed' : 'Critical')
  const riskLevel = String(latest.risk_level || '').toLowerCase()
  const yieldLoss = Math.min(85, Math.max(0, Math.round(toNumber(reportHealth?.yield_loss_prediction, avgWeedPercentage * 1.35))))
  const waterStress = reportHealth?.water_stress_level || (weedPercentage > 40 ? 'High' : weedPercentage > 20 ? 'Moderate' : 'Low')
  const nutrition = reportHealth?.nutritional_status || (vigorScore >= 80 ? 'Excellent' : vigorScore >= 60 ? 'Good' : vigorScore >= 40 ? 'Fair' : 'Poor')
  const diseaseRisk = reportHealth?.disease_risk || (riskLevel.includes('high') || weedPercentage > 35 ? 'High' : weedPercentage > 18 ? 'Moderate' : 'Low')
  const damageCost = Math.round(toNumber(reportHealth?.estimated_damage_cost, Math.max(0, weedPercentage * 18)))

  return {
    current_health: {
      crop_vigor_score: vigorScore,
      condition,
      crop_percentage: cropPercentage,
      weed_percentage: weedPercentage,
      confidence_level: confidence,
      timestamp: latest.timestamp,
    },
    health_metrics: {
      yield_loss_prediction: `${yieldLoss}%`,
      water_stress_level: waterStress,
      nutritional_status: nutrition,
      disease_risk: diseaseRisk,
      estimated_damage_cost: `$${damageCost}`,
      days_until_critical: weedPercentage > 40 ? 3 : weedPercentage > 25 ? 7 : 14,
    },
    trends: [...history]
      .slice(0, 8)
      .reverse()
      .map((entry, index) => {
        const cropPct = percentFromEntry(entry, 'crops')
        const weedPct = percentFromEntry(entry, 'weeds')
        const entryConfidence = entry.confidence > 1 ? entry.confidence / 100 : entry.confidence
        return {
          scan_index: index + 1,
          vigor_score: clampScore(cropPct - weedPct * 0.55 + entryConfidence * 25),
          crop_pct: cropPct,
          weed_pct: weedPct,
          timestamp: entry.timestamp,
        }
      }),
    recommendations: [
      {
        type: weedPercentage > 35 ? 'critical' : weedPercentage > 18 ? 'warning' : 'info',
        title: weedPercentage > 35 ? 'High weed pressure detected' : weedPercentage > 18 ? 'Monitor weed spread' : 'Crop condition is stable',
        description: reportHealth?.notes || `Latest scan shows ${cropPercentage}% crop coverage and ${weedPercentage}% weed pressure. Weed spread is ${reportWeed?.weed_spread?.toLowerCase() || 'being monitored'}.`,
        action: weedPercentage > 35 ? 'Prioritize spot treatment in affected zones.' : weedPercentage > 18 ? 'Schedule a follow-up scan and localized removal.' : 'Continue routine monitoring.',
      },
    ],
    summary: {
      total_scans: history.length,
      avg_crop_percentage: avgCropPercentage,
      avg_weed_percentage: avgWeedPercentage,
      health_trend: avgWeedPercentage > 30 ? 'declining' : avgCropPercentage >= 65 ? 'improving' : 'stable',
    },
  }
}

function MetricRow({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ color: '#94a3b8', fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ color, fontSize: 16, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function HealthMetricCard({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass glow-green-sm"
      style={{
        padding: 20,
        borderRadius: 24,
        background: 'rgba(8, 16, 10, 0.7)',
        border: `1px solid ${color}40`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ color }}>{icon}</div>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</p>
      </div>
      <p style={{ margin: 0, color, fontSize: 28, fontWeight: 700 }}>{value}</p>
      <p style={{ margin: 0, color: '#cbd5e1', fontSize: 12 }}>{description}</p>
    </motion.div>
  )
}

function SummaryMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(34,197,94,0.05)', borderRadius: 12 }}>
      <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
      <span style={{ color, fontSize: 16, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

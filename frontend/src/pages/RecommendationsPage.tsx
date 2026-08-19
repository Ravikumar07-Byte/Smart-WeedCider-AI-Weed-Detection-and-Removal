import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertTriangle, TrendingUp, IndianRupee, Calendar, Target, Leaf, Zap, BarChart3, Droplets, ShieldCheck, Sprout } from 'lucide-react'
import type { HistoryEntry, RecommendationsResponse } from '../api'
import { fetchRecommendations } from '../api'

type Recommendation = {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'immediate' | 'scheduled' | 'preventive'
  status: 'pending' | 'in_progress' | 'completed'
  estimated_cost: number
  timeline: string
  actions: string[]
  risk_level: string
  potential_impact: string
  confidence: number
  icon?: string
}

type RecommendationsPageProps = {
  history: HistoryEntry[]
  loading: boolean
  profileId?: string
}

// Fallback recommendation generation if API fails
function generateFallbackRecommendations(scanHistory: HistoryEntry[]): Recommendation[] {
  const recs: Recommendation[] = []

  const latestScan = scanHistory[0]
  if (latestScan) {
    const weedPct = latestScan.weed_pct ?? (latestScan.total > 0 ? Math.round((latestScan.weeds / latestScan.total) * 100) : 0)
    const cropPct = latestScan.crop_pct ?? (latestScan.total > 0 ? Math.round((latestScan.crops / latestScan.total) * 100) : 0)
    const avgWeedPct = Math.round(scanHistory.reduce((sum, scan) => sum + (scan.weed_pct ?? (scan.total ? (scan.weeds / scan.total) * 100 : 0)), 0) / scanHistory.length)
    const weedTrend = scanHistory.length > 1
      ? weedPct - (scanHistory[1].weed_pct ?? (scanHistory[1].total ? (scanHistory[1].weeds / scanHistory[1].total) * 100 : weedPct))
      : 0

    if (weedPct > 50) {
      recs.push({
        id: 'immediate_weed_removal',
        title: 'Urgent Weed Removal Required',
        description: 'High weed infestation detected. Immediate mechanical or chemical intervention needed.',
        priority: 'high',
        category: 'immediate',
        estimated_cost: 150,
        timeline: 'Within 24-48 hours',
        actions: ['Manual weed pulling', 'Mechanical cultivation', 'Selective herbicide application'],
        risk_level: 'High',
        potential_impact: 'Prevent 30-50% crop yield loss',
        confidence: 95,
        status: 'pending'
      })
    } else if (weedPct > 20) {
      recs.push({
        id: 'moderate_weed_control',
        title: 'Moderate Weed Control Needed',
        description: 'Weeds are competing with crops. Implement targeted removal strategies.',
        priority: 'medium',
        category: 'immediate',
        estimated_cost: 75,
        timeline: 'Within 3-5 days',
        actions: ['Spot treatment with herbicide', 'Hand weeding in affected areas', 'Adjust irrigation patterns'],
        risk_level: 'Medium',
        potential_impact: 'Maintain current yield levels',
        confidence: 85,
        status: 'pending'
      })
    } else {
      recs.push({
        id: 'low_pressure_spot_scouting',
        title: 'Targeted Spot Scouting',
        description: 'Weed pressure is low, so keep treatment focused only on detected patches instead of applying broad intervention.',
        priority: 'low',
        category: 'scheduled',
        estimated_cost: 25,
        timeline: 'Within 7 days',
        actions: ['Inspect detected zones', 'Remove isolated weeds', 'Avoid disturbing healthy crop rows'],
        risk_level: 'Low',
        potential_impact: 'Preserve crop health while reducing unnecessary treatment cost',
        confidence: 82,
        status: 'pending'
      })
    }

    recs.push({
      id: 'crop_vigor_support',
      title: cropPct >= 70 ? 'Maintain Crop Vigor' : 'Improve Crop Stand Density',
      description: cropPct >= 70
        ? `Crop coverage is ${cropPct}%, so prioritize nutrition consistency and avoid root-zone stress.`
        : `Crop coverage is only ${cropPct}%, so the field needs density improvement and closer stress monitoring.`,
      priority: cropPct >= 70 ? 'medium' : 'high',
      category: 'scheduled',
      estimated_cost: cropPct >= 70 ? 120 : 220,
      timeline: cropPct >= 70 ? 'This week' : 'Within 48-72 hours',
      actions: cropPct >= 70
        ? ['Apply balanced fertilizer', 'Keep irrigation uniform', 'Re-scan after nutrient application']
        : ['Check seedling gaps', 'Inspect nutrient deficiency signs', 'Plan gap filling where crop rows are thin'],
      risk_level: cropPct >= 70 ? 'Medium' : 'High',
      potential_impact: cropPct >= 70 ? 'Protect current yield potential' : 'Recover weak crop zones before weed competition increases',
      confidence: Math.max(72, Math.min(96, latestScan.confidence || 84)),
      status: 'pending'
    })

    recs.push({
      id: 'irrigation_balance',
      title: 'Irrigation Balance Check',
      description: weedPct > 25
        ? 'Weeds can consume water faster than young crops. Keep irrigation targeted to crop rows and avoid wetting weed-heavy margins.'
        : 'Current weed pressure allows normal irrigation, but soil moisture should be checked before the next scan.',
      priority: weedPct > 35 ? 'high' : 'medium',
      category: 'preventive',
      estimated_cost: 60,
      timeline: 'Next irrigation cycle',
      actions: ['Check soil moisture at root depth', 'Reduce water on weed-heavy edges', 'Record irrigation timing with scan results'],
      risk_level: weedPct > 35 ? 'High' : 'Medium',
      potential_impact: 'Reduce weed advantage and stabilize crop growth',
      confidence: 86,
      status: 'pending'
    })

    recs.push({
      id: 'weekly_monitoring',
      title: 'Weekly Field Monitoring',
      description: `Average weed pressure across saved scans is ${avgWeedPct}%. ${weedTrend > 5 ? 'Recent weed pressure is increasing, so shorten the scan interval.' : 'Continue regular scanning to confirm field stability.'}`,
      priority: weedTrend > 5 ? 'high' : 'medium',
      category: 'scheduled',
      estimated_cost: 0,
      timeline: weedTrend > 5 ? 'Every 3 days' : 'Weekly',
      actions: ['Scan the same field section', 'Compare weed percentage trend', 'Log weather and irrigation conditions'],
      risk_level: weedTrend > 5 ? 'High' : 'Low',
      potential_impact: 'Early trend detection prevents major crop competition',
      confidence: 88,
      status: 'pending'
    })

    recs.push({
      id: 'mulch_application',
      title: 'Organic Mulch Application',
      description: 'Apply organic mulch between crop rows to suppress weed growth naturally.',
      priority: 'low',
      category: 'preventive',
      estimated_cost: 200,
      timeline: 'Next planting season',
      actions: ['Purchase organic mulch', 'Apply 2-3 inch layer between rows', 'Monitor mulch breakdown'],
      risk_level: 'Low',
      potential_impact: 'Reduce weed emergence by 60-80%',
      confidence: 75,
      status: 'pending'
    })
  }

  return recs
}

const normalizeRecommendation = (rec: Partial<Recommendation> & { detail?: string }, index: number): Recommendation => ({
  id: rec.id || `recommendation_${index}`,
  title: rec.title || 'Crop Care Recommendation',
  description: rec.description || rec.detail || 'Review recent scan results and apply targeted field action.',
  priority: rec.priority || (index === 0 ? 'high' : 'medium'),
  category: rec.category || (index === 0 ? 'immediate' : 'scheduled'),
  status: rec.status || 'pending',
  estimated_cost: Number(rec.estimated_cost ?? (index === 0 ? 150 : 75)),
  timeline: rec.timeline || (index === 0 ? 'Within 48 hours' : 'This week'),
  actions: Array.isArray(rec.actions) && rec.actions.length ? rec.actions : ['Inspect affected crop rows', 'Apply targeted field action', 'Re-scan after completion'],
  risk_level: rec.risk_level || (index === 0 ? 'High' : 'Medium'),
  potential_impact: rec.potential_impact || 'Improve crop health and reduce weed competition',
  confidence: Number(rec.confidence ?? 84),
})

export function RecommendationsPage({ history, loading, profileId }: RecommendationsPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsResponse | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'immediate' | 'scheduled' | 'preventive'>('all')
  const [apiLoading, setApiLoading] = useState(false)

  // Fetch recommendations from API
  useEffect(() => {
    const loadRecommendations = async () => {
      if (history.length === 0) {
        setRecommendations([])
        setRecommendationsData(null)
        setApiLoading(false)
        return
      }

      setApiLoading(true)
      try {
        const data = await fetchRecommendations(profileId)
        setRecommendationsData(data)
        const recsWithStatus = data.recommendations.map((rec, index) => normalizeRecommendation(rec, index))
        setRecommendations(recsWithStatus)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
        const fallbackRecs = generateFallbackRecommendations(history)
        setRecommendationsData(null)
        setRecommendations(fallbackRecs)
      } finally {
        setApiLoading(false)
      }
    }

    loadRecommendations()
  }, [history, profileId])

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const statusMatch = filter === 'all' || rec.status === filter
      const categoryMatch = categoryFilter === 'all' || rec.category === categoryFilter
      return statusMatch && categoryMatch
    })
  }, [recommendations, filter, categoryFilter])

  const cropPlan = useMemo(() => {
    const latest = history[0]
    const previous = history[1]
    const cropPct = latest?.crop_pct ?? (latest?.total ? Math.round((latest.crops / latest.total) * 100) : 0)
    const weedPct = latest?.weed_pct ?? (latest?.total ? Math.round((latest.weeds / latest.total) * 100) : 0)
    const previousWeedPct = previous?.weed_pct ?? (previous?.total ? Math.round((previous.weeds / previous.total) * 100) : weedPct)
    const weedDelta = Math.round((weedPct - previousWeedPct) * 10) / 10
    const vigor = Math.max(0, Math.min(100, Math.round(cropPct * 0.75 + (latest?.confidence ?? 80) * 0.25 - weedPct * 0.2)))

    return {
      cropPct,
      weedPct,
      weedDelta,
      vigor,
      actionWindow: weedPct > 45 ? '24 hours' : weedPct > 20 ? '3 days' : '7 days',
      focus: weedPct > 45 ? 'Emergency weed removal' : cropPct < 55 ? 'Crop stand recovery' : weedPct > 20 ? 'Targeted weed control' : 'Preventive crop care',
      irrigation: weedPct > 30 ? 'Keep water focused on crop rows' : 'Maintain normal irrigation cycle',
      nutrition: cropPct < 60 ? 'Prioritize nitrogen and gap recovery' : 'Maintain balanced nutrition',
    }
  }, [history])

  const stats = useMemo(() => {
    if (recommendationsData?.stats && recommendationsData?.analysis) {
      const completed = recommendations.filter(r => r.status === 'completed').length
      const pending = recommendations.filter(r => r.status === 'pending').length
      const highPriority = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length

      return {
        total: recommendationsData.stats.total_recommendations,
        completed,
        pending,
        highPriority,
        avgWeedPercentage: recommendationsData.stats.avg_weed_percentage,
        riskTrend: recommendationsData.stats.risk_trend,
        estimatedCost: recommendationsData.stats.estimated_cost,
        potentialSavings: recommendationsData.stats.potential_savings,
        weedPressureLevel: recommendationsData.analysis.weed_pressure_level,
        actionFrequency: recommendationsData.analysis.recommended_action_frequency
      }
    }

    const total = recommendations.length
    const completed = recommendations.filter(r => r.status === 'completed').length
    const pending = recommendations.filter(r => r.status === 'pending').length
    const highPriority = recommendations.filter(r => r.priority === 'high').length

    return { total, completed, pending, highPriority }
  }, [recommendations, recommendationsData])

  const toggleRecommendationStatus = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, status: rec.status === 'completed' ? 'pending' : 'completed' }
          : rec
      )
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'rgba(239, 68, 68, 0.8)'
      case 'high': return 'rgba(239, 68, 68, 0.8)'
      case 'medium': return 'rgba(245, 158, 11, 0.8)'
      case 'low': return 'rgba(34, 197, 94, 0.8)'
      default: return 'rgba(156, 163, 175, 0.8)'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} color="#22c55e" />
      case 'in_progress': return <Clock size={20} color="#f59e0b" />
      default: return <AlertTriangle size={20} color="#ef4444" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate': return <Zap size={16} />
      case 'scheduled': return <Calendar size={16} />
      case 'preventive': return <Target size={16} />
      default: return <Leaf size={16} />
    }
  }

  if (loading || apiLoading) {
    return (
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
        <div className="glass" style={{ padding: 28, borderRadius: 32 }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            Loading recommendations...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 32, marginBottom: 8 }}>Smart Recommendations</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16 }}>
            AI-powered farming recommendations based on your field scans and crop health analysis
          </p>
        </div>

        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="glass glow-green-sm"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 18, marginBottom: 32, padding: 22, borderRadius: 28, background: 'rgba(8, 16, 10, 0.72)', border: '1px solid rgba(34,197,94,0.18)' }}
          >
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Crop recommendation plan</p>
              <h2 style={{ margin: '8px 0 0', color: '#fff', fontSize: 24 }}>{cropPlan.focus}</h2>
              <p style={{ margin: '12px 0 0', color: '#c8f1d7', fontSize: 14, lineHeight: 1.65 }}>
                Latest scan shows {cropPlan.cropPct}% crop coverage and {cropPlan.weedPct}% weed pressure. Recommended action window is {cropPlan.actionWindow}.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Sprout size={20} color="#86efac" />
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 11 }}>Crop vigor</p>
                <p style={{ margin: '4px 0 0', color: '#fff', fontSize: 22, fontWeight: 800 }}>{cropPlan.vigor}%</p>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.18)' }}>
                <Droplets size={20} color="#93c5fd" />
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 11 }}>Irrigation</p>
                <p style={{ margin: '4px 0 0', color: '#dbeafe', fontSize: 13, fontWeight: 700 }}>{cropPlan.irrigation}</p>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.18)' }}>
                <ShieldCheck size={20} color="#fcd34d" />
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 11 }}>Nutrition</p>
                <p style={{ margin: '4px 0 0', color: '#fef3c7', fontSize: 13, fontWeight: 800 }}>{cropPlan.nutrition}</p>
              </div>
              <div style={{ padding: 14, borderRadius: 18, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <TrendingUp size={20} color="#fecaca" />
                <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 11 }}>Weed trend</p>
                <p style={{ margin: '4px 0 0', color: cropPlan.weedDelta > 0 ? '#fecaca' : '#bbf7d0', fontSize: 13, fontWeight: 800 }}>
                  {cropPlan.weedDelta > 0 ? `+${cropPlan.weedDelta}% rising` : `${cropPlan.weedDelta}% stable`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Dashboard */}
        {recommendationsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}
          >
            <div className="glass" style={{ padding: 20, borderRadius: 24, background: 'rgba(8, 16, 10, 0.7)', border: '1px solid rgba(34,197,94,0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>📋</div>
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Total Recommendations</p>
                  <p style={{ margin: 0, color: '#22c55e', fontSize: 24, fontWeight: 600 }}>{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 20, borderRadius: 24, background: 'rgba(8, 16, 10, 0.7)', border: '1px solid rgba(34,197,94,0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Target size={24} color="#22c55e" />
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Completed</p>
                  <p style={{ margin: 0, color: '#22c55e', fontSize: 24, fontWeight: 600 }}>{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 20, borderRadius: 24, background: 'rgba(8, 16, 10, 0.7)', border: '1px solid rgba(34,197,94,0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BarChart3 size={24} color="#3b82f6" />
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Risk Trend</p>
                  <p style={{ margin: 0, color: stats.riskTrend === 'increasing' ? '#ef4444' : '#22c55e', fontSize: 24, fontWeight: 600 }}>
                    {stats.riskTrend === 'increasing' ? '📈' : stats.riskTrend === 'decreasing' ? '📉' : '→'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 20, borderRadius: 24, background: 'rgba(8, 16, 10, 0.7)', border: '1px solid rgba(34,197,94,0.16)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <IndianRupee size={24} color="#22c55e" />
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Est. Investment</p>
                  <p style={{ margin: 0, color: '#22c55e', fontSize: 24, fontWeight: 600 }}>₹{stats.estimatedCost}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: 32 }}
        >
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>Filter by Status</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              className={`glass ${filter === 'all' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(34,197,94,0.3)',
                background: filter === 'all' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`glass ${filter === 'pending' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(239,68,68,0.3)',
                background: filter === 'pending' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`glass ${filter === 'completed' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(34,197,94,0.3)',
                background: filter === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Completed
            </button>
          </div>

          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginTop: 16, marginBottom: 12 }}>Filter by Category</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`glass ${categoryFilter === 'all' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(34,197,94,0.3)',
                background: categoryFilter === 'all' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('immediate')}
              className={`glass ${categoryFilter === 'immediate' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(239,68,68,0.3)',
                background: categoryFilter === 'immediate' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Immediate
            </button>
            <button
              onClick={() => setCategoryFilter('scheduled')}
              className={`glass ${categoryFilter === 'scheduled' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(245,158,11,0.3)',
                background: categoryFilter === 'scheduled' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Scheduled
            </button>
            <button
              onClick={() => setCategoryFilter('preventive')}
              className={`glass ${categoryFilter === 'preventive' ? 'glow-green-sm' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid rgba(34,197,94,0.3)',
                background: categoryFilter === 'preventive' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Preventive
            </button>
          </div>
        </motion.div>

        {/* Recommendations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'grid', gap: 20 }}
        >
          {filteredRecommendations.length === 0 ? (
            <div className="glass" style={{ padding: 40, borderRadius: 32, textAlign: 'center', background: 'rgba(8, 16, 10, 0.7)', border: '1px solid rgba(34,197,94,0.16)' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 18 }}>
                {history.length === 0 ? 'No scan history available. Upload an image to get personalized recommendations.' : 'No recommendations match your current filters.'}
              </p>
            </div>
          ) : (
            filteredRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass glow-green-sm"
                style={{
                  padding: 24,
                  borderRadius: 28,
                  background: 'rgba(8, 16, 10, 0.7)',
                  border: `1px solid ${getPriorityColor(rec.priority)}`,
                  cursor: 'pointer'
                }}
                onClick={() => toggleRecommendationStatus(rec.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 32 }}>{rec.icon || getCategoryIcon(rec.category)}</div>
                    <div>
                      <h3 style={{ margin: 0, color: '#fff', fontSize: 20, marginBottom: 4 }}>{rec.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 12,
                          background: getPriorityColor(rec.priority),
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {rec.priority} priority
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: 14 }}>
                          {getCategoryIcon(rec.category)}
                          {rec.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getStatusIcon(rec.status)}
                    <span style={{
                      color: rec.status === 'completed' ? '#22c55e' : rec.status === 'in_progress' ? '#f59e0b' : '#ef4444',
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, color: '#d1fae5', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  {rec.description}
                </p>

                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{rec.timeline}</span>
                  </div>
                  {rec.estimated_cost !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IndianRupee size={16} color="#94a3b8" />
                      <span style={{ color: '#94a3b8', fontSize: 14 }}>₹{rec.estimated_cost} estimated</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={16} color="#94a3b8" />
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>{rec.potential_impact}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(34,197,94,0.2)', paddingTop: 16 }}>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>Recommended Actions:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {rec.actions.map((action, actionIndex) => (
                      <span
                        key={actionIndex}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 16,
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          color: '#d1fae5',
                          fontSize: 13
                        }}
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

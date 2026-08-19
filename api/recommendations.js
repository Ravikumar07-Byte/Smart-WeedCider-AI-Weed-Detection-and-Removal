const { handleOptions, sendJson } = require('./_lib')

module.exports = function handler(req, res) {
  if (handleOptions(req, res)) return
  sendJson(res, 200, {
    recommendations: [
      {
        id: 'target-weeds',
        title: 'Target detected weed zones',
        description: 'Use scan detections to prioritize treatment.',
        priority: 'medium',
        category: 'immediate',
        estimated_cost: 0,
        timeline: '48 hours',
        actions: ['Inspect detected areas', 'Apply targeted weeding', 'Rescan after treatment'],
        risk_level: 'Medium',
        potential_impact: 'Reduces crop competition',
        confidence: 84,
      },
    ],
    stats: {
      total_scans: 0,
      avg_weed_percentage: 0,
      risk_trend: 'stable',
      total_recommendations: 1,
      estimated_cost: 0,
      potential_savings: 0,
    },
    analysis: {
      weed_pressure_level: 'medium',
      recommended_action_frequency: 'weekly',
      cost_benefit_ratio: 1,
    },
  })
}

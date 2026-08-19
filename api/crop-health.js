const { handleOptions, now, sendJson } = require('./_lib')

module.exports = function handler(req, res) {
  if (handleOptions(req, res)) return
  sendJson(res, 200, {
    current_health: {
      crop_vigor_score: 72,
      condition: 'Good',
      crop_percentage: 74,
      weed_percentage: 26,
      confidence_level: 84,
      timestamp: now(),
    },
    health_metrics: {
      yield_loss_prediction: '34%',
      water_stress_level: 'Unknown from image only',
      nutritional_status: 'Needs field validation',
      disease_risk: 'Not detected by this model',
      estimated_damage_cost: 'Requires farm cost data',
      days_until_critical: 7,
    },
    trends: [],
    recommendations: [
      {
        type: 'info',
        title: 'Monitor weed pressure',
        description: 'Use scan history to compare weed ratio over time.',
        action: 'Rescan after intervention.',
      },
    ],
    summary: {
      total_scans: 0,
      avg_crop_percentage: 74,
      avg_weed_percentage: 26,
      health_trend: 'stable',
    },
  })
}

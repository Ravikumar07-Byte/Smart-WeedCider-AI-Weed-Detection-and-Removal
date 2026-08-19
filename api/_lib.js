const now = () => new Date().toISOString()

function sendJson(res, status, data) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = status
  res.end(JSON.stringify(data))
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true })
    return true
  }
  return false
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function pct(part, total) {
  return total ? Math.round((part / total) * 1000) / 10 : 0
}

function riskLevel(weeds, crops) {
  const total = weeds + crops
  const weedPct = pct(weeds, total)
  if (weedPct >= 45 || weeds > crops) return 'high'
  if (weedPct >= 20) return 'medium'
  return 'low'
}

function filenameSeed(filename) {
  return Array.from(filename || 'uploaded-image.jpg').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function demoScanResult(filename = 'uploaded-image.jpg') {
  const seed = filenameSeed(filename)
  const total = 14 + (seed % 24)
  const weedHeavy = filename.toLowerCase().includes('weed') || seed % 5 === 0
  const weeds = Math.max(1, Math.floor(total * (weedHeavy ? 0.56 : 0.23)))
  const crops = Math.max(1, total - weeds)
  const avgConfidence = 82 + (seed % 14)
  const risk = riskLevel(weeds, crops)
  const cropPct = pct(crops, total)
  const weedPct = pct(weeds, total)
  const scanId = `scan-${Date.now()}-${seed}`
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iIzBiMTMwZiIvPjx0ZXh0IHg9IjMyMCIgeT0iMjQwIiBmaWxsPSIjYTZmNGM1IiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldlZWRJQ2lkZXIgRGV0ZWN0aW9uPC90ZXh0Pjwvc3ZnPg=='

  return {
    image: placeholder,
    original_thumb: placeholder,
    detections: Array.from({ length: total }, (_, index) => ({
      class: index < crops ? 'crop' : 'weed',
      confidence: Math.min(98, avgConfidence + (index % 5) - 2),
      bbox: [
        Math.round(((index * 37) % 520) * 100) / 100,
        Math.round(((index * 53) % 360) * 100) / 100,
        52 + (index % 6) * 7,
        42 + (index % 5) * 8,
      ],
    })),
    metrics: {
      total,
      crops,
      weeds,
      crop_pct: cropPct,
      weed_pct: weedPct,
      avg_confidence: avgConfidence,
      inference_time_ms: 120 + (seed % 180),
      risk_level: risk,
    },
    summary: `Detected ${crops} crops and ${weeds} weeds. Weed ratio is ${weedPct}%.`,
    mode: 'vercel-demo',
    recommendations: [
      { icon: 'target', text: 'Treat detected weed clusters first.' },
      { icon: 'leaf', text: 'Protect healthy crop rows during intervention.' },
      { icon: 'calendar', text: 'Run a follow-up scan after field action.' },
    ],
    report: {
      detection_summary: {
        total_crops: crops,
        total_weeds: weeds,
        confidence: avgConfidence,
        risk_level: risk,
        weed_ratio: `${weedPct}%`,
        crop_ratio: `${cropPct}%`,
      },
      crop_health_analysis: {
        condition: risk === 'low' ? 'Good' : risk === 'medium' ? 'Fair' : 'At risk',
        crop_density: crops ? 'Stable' : 'No crops detected',
        healthy_crop_ratio: `${cropPct}%`,
        crop_vigor_score: Math.max(0, Math.round(100 - weedPct * 1.2)),
        yield_loss_prediction: `${Math.min(85, Math.round(weedPct * 1.3))}%`,
        water_stress_level: 'Unknown from image only',
        nutritional_status: 'Needs field validation',
        disease_risk: 'Not detected by this model',
        estimated_damage_cost: 'Requires farm cost data',
        notes: 'Vercel serverless demo inference is active. Attach a Render/Fly GPU/CPU backend for YOLO weights.',
      },
      weed_infestation_analysis: {
        severity: risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low',
        weed_spread: risk === 'high' ? 'High-density patches' : risk === 'medium' ? 'Localized patches' : 'Minimal visible pressure',
        affected_zones: 'Review detection boxes in the output image.',
        competition_risk: risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low',
      },
      recommendations: [
        { title: 'Target weed zones', detail: 'Prioritize weed-heavy areas before they compete further with crop rows.' },
        { title: 'Verify detections', detail: 'Manually inspect detections before field action.' },
        { title: 'Run follow-up scan', detail: 'Scan the same field after treatment to compare crop and weed ratios.' },
      ],
      ai_insights: {
        explanation: 'Serverless demo inference returns deterministic crop and weed detections from the uploaded filename.',
        accuracy: 'Use a dedicated backend with MODEL_URL for real YOLO inference.',
        confidence_scoring: 'Confidence is normalized to a 0-100 percentage scale.',
      },
      field_status: risk === 'high' ? 'Critical - immediate intervention needed' : risk === 'medium' ? 'Watch - targeted monitoring needed' : 'Stable - regular monitoring recommended',
    },
    image_size: { width: 640, height: 480 },
    scan_id: scanId,
  }
}

function emptyStats() {
  return {
    total_scans: 0,
    total_weeds: 0,
    total_crops: 0,
    avg_confidence: 0,
  }
}

module.exports = {
  demoScanResult,
  emptyStats,
  handleOptions,
  now,
  readBody,
  sendJson,
}

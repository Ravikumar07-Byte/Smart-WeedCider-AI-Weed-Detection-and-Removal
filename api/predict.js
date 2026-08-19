const { demoScanResult, handleOptions, readBody, sendJson } = require('./_lib')

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const body = await readBody(req)
    const text = body.toString('latin1', 0, Math.min(body.length, 4096))
    const filename = text.match(/filename="([^"]+)"/)?.[1] || 'uploaded-image.jpg'
    sendJson(res, 200, demoScanResult(filename))
  } catch (error) {
    sendJson(res, 500, { error: 'Prediction failed', detail: String(error && error.message ? error.message : error) })
  }
}

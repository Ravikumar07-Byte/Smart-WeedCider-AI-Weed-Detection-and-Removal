const { handleOptions, now, sendJson } = require('./_lib')

module.exports = function handler(req, res) {
  if (handleOptions(req, res)) return
  sendJson(res, 200, {
    status: 'ready',
    model_loaded: false,
    model_path: '',
    model_error: 'Running on Vercel serverless demo backend. Configure Render/Fly/Railway for real YOLO .pt inference.',
    loaded_classes: ['crop', 'weed'],
    history_count: 0,
    server_time: now(),
    runtime: 'vercel-serverless',
  })
}

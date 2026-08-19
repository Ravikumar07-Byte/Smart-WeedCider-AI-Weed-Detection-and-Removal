const { handleOptions, sendJson } = require('./_lib')

module.exports = function handler(req, res) {
  if (handleOptions(req, res)) return
  sendJson(res, 200, {
    name: 'WeedICider Vercel Demo Detector',
    architecture: 'Serverless demo mode',
    classes: ['crop', 'weed'],
    input_size: 640,
    dataset: 'Combined Dataset',
    images_trained: 1200,
    final_mAP50: 0.421,
    final_mAP50_95: 0.312,
  })
}

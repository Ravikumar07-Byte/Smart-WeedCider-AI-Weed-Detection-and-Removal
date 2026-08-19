const { emptyStats, handleOptions, sendJson } = require('./_lib')

module.exports = function handler(req, res) {
  if (handleOptions(req, res)) return
  sendJson(res, 200, { stats: emptyStats() })
}

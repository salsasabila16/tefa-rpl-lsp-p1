const jwt = require('jsonwebtoken')

module.exports = function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }
  const token = auth.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' })
  }
}

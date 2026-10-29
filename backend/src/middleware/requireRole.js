// Middleware untuk membatasi akses berdasarkan role.
// Gunakan setelah middleware auth.js agar req.user sudah tersedia.
module.exports = function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak. Hanya ' + roles.join('/') + ' yang bisa melakukan ini.' })
    }
    next()
  }
}

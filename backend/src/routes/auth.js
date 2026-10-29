const express = require('express')
const router = express.Router()
const { rateLimit } = require('express-rate-limit')
const { login, register, me, forgotPassword, resetPassword } = require('../controllers/authController')
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, login)
router.post('/register', auth, requireRole('admin'), register)
router.get('/me', auth, me)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router

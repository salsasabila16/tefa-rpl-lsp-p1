const express = require('express')
const router = express.Router()
const c = require('../controllers/pembayaranController')
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')

router.get('/', auth, c.getAll)
router.post('/', auth, c.create)
router.put('/:id', auth, c.update)
// Verifikasi hanya boleh dilakukan oleh bendahara atau admin
router.post('/:id/verifikasi', auth, requireRole('bendahara', 'admin'), c.verifikasi)
router.delete('/:id', auth, c.remove)

module.exports = router

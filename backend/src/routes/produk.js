const express = require('express')
const router = express.Router()
const c = require('../controllers/produkController')
const auth = require('../middleware/auth')

router.get('/', auth, c.getAll)
router.post('/', auth, c.create)
router.put('/:id', auth, c.update)
router.delete('/:id', auth, c.remove)

module.exports = router

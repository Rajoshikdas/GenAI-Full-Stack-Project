const { Router } = require('express')
const aiController = require('../controllers/ai.controller')

const router = Router()

/**
 * POST /api/ai
 * body: { prompt }
 */
router.post('/', aiController.generate)

module.exports = router

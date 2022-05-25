const Router = require('express')
const router = new Router()
const recController = require('../controllers/recController')

router.get('/:id', recController.getRecommendations)

module.exports = router
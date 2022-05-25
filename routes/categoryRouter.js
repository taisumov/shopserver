const Router = require('express')
const router = new Router()
const categoryController = require('../controllers/categoryController')
const checkRole = require('../middleware/CheckRoleMiddleware')

router.post('/', categoryController.create)
router.get('/', categoryController.getAll)
router.get('/:id', categoryController.getByID)
router.post('/delete', categoryController.deleting)

module.exports = router
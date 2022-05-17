const Router = require('express')
const router = new Router()
const adminController = require('../controllers/adminController')

router.get('/', adminController.getUsers)
router.post('/delete', adminController.deleteUser)

module.exports = router
const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const itemRouter = require('./itemRouter')
const categoryRouter = require('./categoryRouter')
const adminRouter = require('./adminRouter')
const recRouter = require('./recRouter')

router.use('/user', userRouter)
router.use('/item', itemRouter)
router.use('/category', categoryRouter)
router.use('/admin', adminRouter)
router.use('/recs', recRouter)

module.exports = router
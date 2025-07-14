const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const providerRouter = require('./providerRouter')
const categoryRouter = require('./categoryRouter')
const typeRouter = require('./typeRouter')
const serviceRouter = require('./serviceRouter')
const orderRouter = require('./orderRouter')
const reviewRouter = require('./reviewRouter')

router.use('/user', userRouter)
router.use('/provider', providerRouter)
router.use('/category', categoryRouter)
router.use('/type', typeRouter)
router.use('/service', serviceRouter)
router.use('/order', orderRouter)
router.use('/review', reviewRouter)

module.exports = router

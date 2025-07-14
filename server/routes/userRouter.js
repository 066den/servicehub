const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const { rateLimit } = require('express-rate-limit')

const smsRateLimit = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 3,
	message: { error: 'Too many requests, please try again later.' },
})

const varifyRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 3,
	message: { error: 'Too many verification attempts, please try again later.' },
})

router.post('/send-code', smsRateLimit, userController.sendCode)

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/auth', userController.check)

module.exports = router

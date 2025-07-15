const { User } = require('../models/models')
const i18n = require('../utils/i18n')
const { validatePhoneNumber } = require('../utils/phoneUtils')
const authService = require('../services/authService')
const authMiddleware = require('../middleware/authMiddleware')

class UserController {
	async sendCode(req, res) {
		try {
			const { phone } = req.body
			if (!phone) {
				return res.status(400).json({ error: i18n.t('errors.invalid_phone') })
			}

			if (!validatePhoneNumber(phone)) {
				return res.status(400).json({ error: i18n.t('errors.invalid_phone') })
			}

			const result = await authService.sendVerificationCode(
				phone,
				req.ip,
				req.language
			)

			return res.json(result)
		} catch (error) {
			console.error('Ошибка отправки кода:', error)
			res.status(400).json({ error: error.message })
		}
	}

	async registration(req, res) {
		const { phone, firstName, lastName, code } = req.body
		if (!phone || !code) {
			return res
				.status(400)
				.json({ error: i18n.t('errors.phone_and_code_required') })
		}

		if (!firstName) {
			return res
				.status(400)
				.json({ error: i18n.t('errors.first_name_required') })
		}

		try {
			const result = await authService.verifyCode(
				phone,
				code,
				req.ip,
				req.get('user-agent'),
				req.language,
				firstName,
				lastName
			)
			return res.json(result)
		} catch (error) {
			console.error('Ошибка проверки кода:', error)
			res.status(400).json({ error: error.message })
		}
	}

	async login(req, res) {
		const { phone, code } = req.body
		if (!phone || !code) {
			return res
				.status(400)
				.json({ error: i18n.t('errors.phone_and_code_required') })
		}

		try {
			const result = await authService.verifyCode(
				phone,
				code,
				req.ip,
				req.get('user-agent'),
				req.language
			)
			return res.json(result)
		} catch (error) {
			console.error('Ошибка проверки кода:', error)
			res.status(400).json({ error: error.message })
		}
	}

	async logout(req, res) {
		try {
			//await req.session.destroy()
			return res.json({ message: i18n.t('success.logout') })
		} catch (error) {
			console.error('Ошибка выхода:', error)
			res.status(400).json({ error: error.message })
		}
	}

	async check(req, res) {
		if (req.user) {
			res.json({
				user: {
					id: req.user.id,
					phone: req.user.phone,
					phoneNormalized: req.user.phoneNormalized,
					isVerified: req.user.isVerified,
				},
				session: {
					id: req.session.id,
					token: req.session.token,
					lastActivityAt: req.session.lastActivityAt,
					expiresAt: req.session.expiresAt,
				},
			})
		} else {
			res.status(401).json({ error: 'Unauthorized' })
		}
	}
}

module.exports = new UserController()

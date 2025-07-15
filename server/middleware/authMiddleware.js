const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { Session } = require('../models/models')

const authMiddleware = async (req, res, next) => {
	if (req.method === 'OPTIONS') {
		next()
	}

	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			req.user = null
			req.session = null
			return next()
		}

		const token = authHeader.split(' ')[1]
		let decoded
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET)
		} catch (jwtError) {
			return res
				.status(401)
				.json({ error: 'Invalid token', code: 'INVALID_TOKEN' })
		}

		const session = await Session.findOne({
			where: {
				token,
				isActive: true,
				expiresAt: { [Op.gt]: new Date() },
			},
			include: [
				{
					model: User,
					attributes: [
						'id',
						'phone',
						'phoneNormalized',
						'isVerified',
						'isActive',
						'isBlocked',
					],
				},
			],
		})

		if (session && session.User) {
			if (session.User.isBlocked) {
				return res
					.status(401)
					.json({ error: 'User is blocked', code: 'USER_BLOCKED' })
			}
			await session.update({ lastActivityAt: new Date() })
			req.session = session
			req.user = session.User
			req.authInfo = {
				userId: session.User.id,
				sessionId: session.id,
				tokenExpiration: decoded.exp,
			}
		} else {
			req.user = null
			req.session = null
		}

		next()
	} catch (error) {
		console.error('Error in authMiddleware:', error)
		req.user = null
		req.session = null
		next()
	}
}

module.exports = authMiddleware

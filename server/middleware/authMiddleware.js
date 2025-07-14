const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		next()
	}

	try {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			res.status(401).json({ message: 'Unauthorized' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (error) {
		res.status(401).json({ message: 'Unauthorized' })
	}
}

module.exports = authMiddleware

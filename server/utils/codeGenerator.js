const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const generateToken = (userId, phone) => {
	const accessToken = jwt.sign({ userId, phone }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '24h',
	})
	const refreshToken = crypto.randomBytes(64).toString('hex')
	return { accessToken, refreshToken }
}

const generateCode = (length = 6) => {
	const min = Math.pow(10, length - 1)
	const max = Math.pow(10, length) - 1
	return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

const generateSecureCode = (length = 6) => {
	const buffer = crypto.randomBytes(length)
	let code = ''

	for (let i = 0; i < length; i++) {
		code += (buffer[i] % 10).toString()
	}

	return code
}

module.exports = { generateToken, generateSecureCode }

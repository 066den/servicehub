const { VerificationCode, SmsLog } = require('../models/models')
const jwt = require('jsonwebtoken')
const { generateToken, generateSecureCode } = require('../utils/codeGenerator')
const crypto = require('crypto')
const i18n = require('../utils/i18n')
const { Op } = require('sequelize')
const { User } = require('../models/models')
const { Session } = require('../models/models')
const {
	validatePhoneNumber,
	getOperator,
	normalizePhoneNumber,
} = require('../utils/phoneUtils')
const TurboSMSService = require('./turboSmsService')

const verifyToken = token => {
	return jwt.verify(token, process.env.JWT_SECRET)
}

class AuthService {
	async sendVerificationCode(phone, ipAddress, language = 'uk') {
		// validate phone
		if (!validatePhoneNumber(phone)) {
			throw new Error(i18n.t('errors.invalid_phone', language))
		}

		const normalizedPhone = normalizePhoneNumber(phone)
		const operator = getOperator(normalizedPhone)

		await this.checkRateLimit(normalizedPhone, ipAddress, language)

		await VerificationCode.update(
			{
				isUsed: true,
			},
			{
				where: {
					phone: normalizedPhone,
					isUsed: false,
					expiresAt: {
						[Op.gt]: new Date(),
					},
				},
			}
		)

		const code = generateSecureCode(4)
		const expiresAt = new Date(
			Date.now() + process.env.CODE_EXPIRES_MINUTES * 60 * 1000
		)

		let smsResult = null
		let smsLog = null

		try {
			await VerificationCode.create({
				phone: normalizedPhone,
				code,
				expiresAt,
				ipAddress,
			})
			const message = i18n.t('sms.verification_code', language, { code })

			smsResult = await TurboSMSService.sendSMS(normalizedPhone, message)
			smsLog = await SmsLog.create({
				phone: normalizedPhone,
				message,
				provider: 'TurboSMS',
				providerMessageId: smsResult.messageId,
				status: smsResult.success ? 'sent' : 'failed',
				cost: smsResult.cost || 0,
				testMode: smsResult.testMode || false,
				ipAddress,
			})

			const user = await User.findOne({
				where: { phoneNormalized: normalizedPhone },
			})

			return {
				success: true,
				expiresAt,
				operator,
				isRegistered: user ? true : false,
				messageId: smsResult.messageId,
				testMode: smsResult.testMode || false,
				message: i18n.t('success.code_sent', language, {
					phone: normalizedPhone,
				}),
				...(smsResult.testMode ? { code } : {}),
			}
		} catch (error) {
			if (smsLog) {
				await smsLog.update({
					status: 'failed',
					errorMessage: error.message,
				})
			} else {
				await SmsLog.create({
					phone: normalizedPhone,
					message: i18n.t('sms.verification_code', language, { code }),
					provider: 'TurboSMS',
					status: 'failed',
					errorMessage: error.message,
					ipAddress,
				})
			}
			throw error
		}
	}

	async verifyCode(
		phone,
		code,
		ipAddress,
		userAgent,
		language = 'uk',
		firstName,
		lastName
	) {
		const normalizedPhone = normalizePhoneNumber(phone)

		const verificationCode = await VerificationCode.findOne({
			where: {
				phone: normalizedPhone,
				code,
				isUsed: false,
				expiresAt: {
					[Op.gt]: new Date(),
				},
			},
		})

		if (!verificationCode) {
			throw new Error(i18n.t('errors.invalid_code', language))
		}

		if (verificationCode.attempts >= process.env.MAX_ATTEMPTS) {
			throw new Error(i18n.t('errors.max_attempts', language))
		}

		await verificationCode.update({
			isUsed: true,
			usedAt: new Date(),
			attempts: verificationCode.attempts + 1,
		})

		const user = await User.findOne({
			where: { phoneNormalized: normalizedPhone },
		})

		if (!user) {
			user = await User.create({
				phone: phone,
				phoneNormalized: normalizedPhone,
				firstName,
				lastName,
				isVerified: true,
				lastLoginAt: new Date(),
			})
		} else {
			await user.update({
				isVerified: true,
				lastLoginAt: new Date(),
			})
		}

		const { accessToken, refreshToken } = generateToken(user.id, phone)

		await Session.create({
			userId: user.id,
			token: accessToken,
			refreshToken,
			ipAddress,
			userAgent,
			expiresAt: new Date(
				Date.now() +
					Number(process.env.SESSION_EXPIRES_IN) * 24 * 60 * 60 * 1000
			),
		})

		return {
			user: {
				id: user.id,
				phone: user.phone,
				isVerified: user.isVerified,
			},
			accessToken,
		}
	}

	async checkRateLimit(phone, ipAddress, language = 'uk') {
		const phoneLimit = await this.getRateLimitCount('phone', phone)

		if (phoneLimit >= (process.env.MAX_SMS_PER_HOUR || 3)) {
			throw new Error(i18n.t('errors.rate_limit_phone', language))
		}

		const ipLimit = await this.getRateLimitCount(
			'ipAddress',
			ipAddress,
			'send-code'
		)
		if (ipLimit >= (process.env.MAX_SMS_PER_IP_HOUR || 10)) {
			throw new Error(i18n.t('errors.rate_limit_ip', language))
		}
	}

	async getRateLimitCount(type, identifier) {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

		const count = await VerificationCode.count({
			where: {
				[type === 'phone' ? 'phone' : 'ipAddress']: identifier,
				createdAt: { [Op.gte]: oneHourAgo },
			},
		})

		return count
	}
}

module.exports = new AuthService()

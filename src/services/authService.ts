import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { generateSecureCode } from '@/utils/codeGenerator'
import { normalizePhone } from '@/utils/phoneUtils'
import { turboSmsService } from './sms/turboSmsService'
import { prisma } from '@/lib/prisma'
import { SMSResult } from '@/types/auth'
import { EStatus } from '@/types'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

interface DeviceInfo {
	ipAddress?: string
	userAgent?: string
	deviceId?: string
}

interface TokenPair {
	accessToken: string
	refreshToken: string
	accessTokenExpiresAt: Date
	refreshTokenExpiresAt: Date
}

class AuthService {
	private readonly CODE_LENGTH = 4
	private readonly ACCESS_TOKEN_EXPIRY = '15m' // 15 минут
	private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30 // 30 дней

	// Вспомогательный метод для проверки ошибок подключения к БД
	private isDatabaseConnectionError(error: unknown): boolean {
		if (error instanceof PrismaClientKnownRequestError) {
			return error.code === 'P1001' || error.code === 'P1000'
		}
		if (error instanceof Error) {
			return (
				error.message?.includes("Can't reach database server") ||
				error.message?.includes('Connection') ||
				error.message?.includes('ECONNREFUSED')
			)
		}
		return false
	}

	async sendVerificationCode(phone: string, ipAddress: string) {
		const normalizedPhone = normalizePhone(phone)

		try {
			const rateLimit = await this.checkRateLimit(normalizedPhone, ipAddress)

			if (rateLimit) {
				return { error: rateLimit }
			}

			// Деактивируем старые коды
			await prisma.verificationCode.updateMany({
				where: {
					phone: normalizedPhone,
					isUsed: false,
					expiresAt: { gt: new Date() },
				},
				data: { isUsed: true },
			})
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error in sendVerificationCode:',
					error
				)
				// Продолжаем выполнение без проверки лимитов при ошибке БД
			} else {
				throw error
			}
		}

		const code = generateSecureCode(this.CODE_LENGTH)

		const codeExpiresMinutes = Number(process.env.CODE_EXPIRES_MINUTES) || 5
		const expiresAt = new Date(Date.now() + codeExpiresMinutes * 60 * 1000)

		try {
			await prisma.verificationCode.create({
				data: {
					phone: normalizedPhone,
					code,
					expiresAt,
					ipAddress: ipAddress || 'unknown',
				},
			})

			const message = turboSmsService.formatVerificationMessage(code, 'uk')

			const smsResult = await turboSmsService.sendSMS(normalizedPhone, message)

			await this.logSMSResult(normalizedPhone, message, smsResult)

			if (smsResult.status !== EStatus.sent) {
				return {
					error: 'sms_send_failed',
				}
			}

			let user = null
			try {
				user = await prisma.user.findUnique({
					where: {
						phoneNormalized: normalizedPhone,
					},
				})
			} catch (error) {
				if (this.isDatabaseConnectionError(error)) {
					console.error(
						'[AuthService] Database connection error while finding user:',
						error
					)
				} else {
					throw error
				}
			}

			return {
				userId: user?.id,
				status: EStatus.sent,
				message: 'success_send_code',
				code,
			}
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error in sendVerificationCode:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			console.error('Error sending verification code:', error)
			try {
				await this.logSMSResult(normalizedPhone, '', {
					status: EStatus.failed,
					error: error instanceof Error ? error.message : String(error),
					provider: 'turbosms',
				})
			} catch (logError) {
				// Игнорируем ошибки логирования при проблемах с БД
				if (!this.isDatabaseConnectionError(logError)) {
					console.error('Error logging SMS result:', logError)
				}
			}
		}
	}

	private async logSMSResult(
		phone: string,
		message: string,
		result: SMSResult
	) {
		try {
			await prisma.smsLog.create({
				data: {
					phone,
					message,
					provider: result.provider,
					status: result.status,
					cost: typeof result.cost === 'number' ? result.cost : 0,
					testMode: process.env.TURBOSMS_TEST_MODE === 'true',
					errorMessage: result.error || '',
				},
			})
		} catch (error) {
			console.error('Error logging SMS result:', error)
		}
	}

	private async checkRateLimit(phone: string, ipAddress: string) {
		let errorMessage = ''

		const phoneLimit = await this.getRateLimitCount('phone', phone)
		if (phoneLimit >= Number(process.env.MAX_SMS_PER_HOUR || 3)) {
			errorMessage = 'rate_limit_phone'
		}

		const ipLimit = await this.getRateLimitCount('ipAddress', ipAddress)
		if (ipLimit >= Number(process.env.MAX_SMS_PER_IP_HOUR || 10)) {
			errorMessage = 'rate_limit_ip'
		}
		return errorMessage
	}

	getRateLimitCount = async (
		type: 'phone' | 'ipAddress',
		identifier: string
	) => {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

		if (!prisma) {
			console.warn('[AuthService] Prisma client is not initialized')
			return 0 // Возвращаем 0 вместо ошибки
		}

		try {
			const whereClause =
				type === 'phone'
					? { phone: identifier, expiresAt: { gte: oneHourAgo } }
					: { ipAddress: identifier, expiresAt: { gte: oneHourAgo } }

			const count = await prisma.verificationCode.count({
				where: whereClause,
			})

			return count
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error in getRateLimitCount:',
					error
				)
				// Возвращаем 0 при ошибке подключения, чтобы не блокировать пользователей
				return 0
			}
			// Для других ошибок логируем и возвращаем 0
			console.error('[AuthService] Error in getRateLimitCount:', error)
			return 0
		}
	}

	async verifyCode(
		phone: string,
		code: string,
		deviceInfo: DeviceInfo = {},
		firstName?: string,
		lastName?: string
	) {
		const normalizedPhone = normalizePhone(phone)

		let verificationCode = null
		try {
			verificationCode = await prisma.verificationCode.findFirst({
				where: {
					phone: normalizedPhone,
					code,
					isUsed: false,
					expiresAt: { gt: new Date() },
				},
			})
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error in verifyCode:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			throw error
		}

		if (!verificationCode) {
			return { error: 'invalid_code_or_expired' }
		}

		if (verificationCode.attempts >= Number(process.env.MAX_ATTEMPTS || 3)) {
			return { error: 'max_attempts_reached' }
		}

		try {
			await prisma.verificationCode.update({
				where: { id: verificationCode.id },
				data: {
					isUsed: true,
					usedAt: new Date(),
					attempts: verificationCode.attempts + 1,
				},
			})
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error updating verification code:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			throw error
		}

		let user = null
		try {
			user = await prisma.user.findUnique({
				where: {
					phoneNormalized: normalizedPhone,
				},
			})
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error finding user in verifyCode:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			throw error
		}

		try {
			if (!user) {
				if (firstName) {
					user = await prisma.user.create({
						data: {
							phone: phone,
							phoneNormalized: normalizedPhone,
							firstName,
							lastName,
							isVerified: true,
							lastLoginAt: new Date(),
						},
					})
				}
			} else {
				user = await prisma.user.update({
					where: {
						id: user.id,
					},
					data: {
						isVerified: true,
						lastLoginAt: new Date(),
						isActive: true,
					},
				})
			}
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error creating/updating user:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			throw error
		}

		if (!user) {
			return { error: 'user_not_found' }
		}

		const tokens = await this.createTokenPair(
			user.id,
			normalizedPhone,
			deviceInfo
		)

		return {
			user: {
				id: user.id,
				phone: user.phone,
				phoneNormalized: user.phoneNormalized,
				firstName: user.firstName,
				lastName: user.lastName,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				role: user.role,
			},
			tokens,
			message: 'success_login',
		}
	}

	async createTokenPair(
		userId: number,
		phone: string,
		deviceInfo: DeviceInfo = {}
	): Promise<TokenPair> {
		const now = new Date()
		const accessTokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 минут
		const refreshTokenExpiresAt = new Date(
			now.getTime() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
		)

		// Создаем access token
		const accessToken = jwt.sign(
			{
				userId,
				phone,
				type: 'access',
			},
			process.env.JWT_SECRET!,
			{
				expiresIn: this.ACCESS_TOKEN_EXPIRY,
				issuer: 'servicehub',
				audience: 'servicehub-client',
			}
		)

		// Создаем refresh token
		const refreshTokenValue = crypto.randomBytes(64).toString('hex')

		// Сохраняем refresh token в БД
		const refreshToken = await prisma.refreshToken.create({
			data: {
				token: refreshTokenValue,
				userId: userId,
				expiresAt: refreshTokenExpiresAt,
				ipAddress: deviceInfo.ipAddress,
				userAgent: deviceInfo.userAgent,
				deviceId: deviceInfo.deviceId,
			},
		})

		// Создаем сессию
		await prisma.session.create({
			data: {
				userId: userId,
				accessToken: accessToken,
				refreshTokenId: refreshToken.id,
				expiresAt: accessTokenExpiresAt,
				ipAddress: deviceInfo.ipAddress,
				userAgent: deviceInfo.userAgent,
				deviceInfo: JSON.stringify(deviceInfo),
			},
		})

		return {
			accessToken,
			refreshToken: refreshTokenValue,
			accessTokenExpiresAt,
			refreshTokenExpiresAt,
		}
	}

	// Обновление access token по refresh token
	async refreshAccessToken(
		refreshTokenValue: string,
		deviceInfo: DeviceInfo = {}
	) {
		// 1. Проверяем refresh token
		const refreshToken = await prisma.refreshToken.findUnique({
			where: { token: refreshTokenValue },
			include: { user: true },
		})

		if (
			!refreshToken ||
			refreshToken.isRevoked ||
			refreshToken.expiresAt < new Date()
		) {
			throw new Error('Недействительный refresh token')
		}

		// 2. Проверяем, что пользователь активен
		if (!refreshToken.user.isActive) {
			throw new Error('Пользователь заблокирован')
		}

		// 3. Деактивируем старую сессию
		await prisma.session.updateMany({
			where: { refreshTokenId: refreshToken.id },
			data: { isActive: false },
		})

		// 4. Создаем новую пару токенов
		const newTokens = await this.createTokenPair(
			refreshToken.user.id,
			refreshToken.user.phoneNormalized ?? '',
			deviceInfo
		)

		// 5. Опционально: отзываем старый refresh token и создаем новый (rotation)
		if (process.env.REFRESH_TOKEN_ROTATION === 'true') {
			await prisma.refreshToken.update({
				where: { id: refreshToken.id },
				data: { isRevoked: true },
			})
		}

		return {
			user: {
				id: refreshToken.user.id,
				phone: refreshToken.user.phone,
				phoneNormalized: refreshToken.user.phoneNormalized,
				isVerified: refreshToken.user.isVerified,
			},
			tokens: newTokens,
		}
	}

	// Проверка валидности access token
	async validateAccessToken(accessToken: string) {
		try {
			// 1. Проверяем JWT
			const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!)
			console.log('decoded', decoded)

			// 2. Проверяем сессию в БД
			const session = await prisma.session.findUnique({
				where: { accessToken },
				include: { user: true },
			})

			if (!session || !session.isActive || session.expiresAt < new Date()) {
				throw new Error('Сессия недействительна')
			}

			if (!session.user.isBlocked) {
				throw new Error('Пользователь заблокирован')
			}

			// 3. Обновляем время последней активности
			await prisma.session.update({
				where: { id: session.id },
				data: { lastActivityAt: new Date() },
			})

			return {
				user: session.user,
				session: session,
			}
		} catch {
			throw new Error('invalid_access_token')
		}
	}

	// Отзыв всех токенов пользователя
	async revokeAllUserTokens(userId: number) {
		await Promise.all([
			prisma.refreshToken.updateMany({
				where: { userId, isRevoked: false },
				data: { isRevoked: true },
			}),
			prisma.session.updateMany({
				where: { userId, isActive: true },
				data: { isActive: false },
			}),
		])
	}

	// Отзыв токенов конкретного устройства
	async revokeDeviceTokens(userId: number, deviceId: string) {
		const refreshTokens = await prisma.refreshToken.findMany({
			where: { userId, deviceId, isRevoked: false },
		})

		const refreshTokenIds = refreshTokens.map((rt: { id: number }) => rt.id)

		await Promise.all([
			prisma.refreshToken.updateMany({
				where: { userId, deviceId },
				data: { isRevoked: true },
			}),
			prisma.session.updateMany({
				where: {
					userId,
					refreshTokenId: { in: refreshTokenIds },
					isActive: true,
				},
				data: { isActive: false },
			}),
		])
	}

	// Очистка истекших токенов (для cron job)
	async cleanupExpiredTokens() {
		const now = new Date()

		await Promise.all([
			prisma.refreshToken.deleteMany({
				where: { expiresAt: { lt: now } },
			}),
			prisma.session.deleteMany({
				where: { expiresAt: { lt: now } },
			}),
			prisma.verificationCode.deleteMany({
				where: { expiresAt: { lt: now } },
			}),
		])
	}

	// Хеширование пароля
	async hashPassword(password: string): Promise<string> {
		const { hashPassword: hash } = await import('@/lib/bcrypt')
		return await hash(password)
	}

	// Проверка пароля
	async verifyPassword(password: string, hash: string): Promise<boolean> {
		const { verifyPassword: verify } = await import('@/lib/bcrypt')
		return await verify(password, hash)
	}

	// Авторизация администратора по email и паролю
	async adminLogin(
		email: string,
		password: string,
		deviceInfo: DeviceInfo = {}
	) {
		try {
			// Находим пользователя по email
			const user = await prisma.user.findUnique({
				where: { email },
			})

			if (!user) {
				return { error: 'invalid_credentials' }
			}

			// Проверяем роль
			if (user.role !== 'ADMIN') {
				return { error: 'access_denied' }
			}

			// Проверяем, что пользователь активен и не заблокирован
			if (!user.isActive || user.isBlocked) {
				return { error: 'account_blocked' }
			}

			// Проверяем наличие пароля
			if (!user.password) {
				return { error: 'password_not_set' }
			}

			// Проверяем пароль
			const isPasswordValid = await this.verifyPassword(
				password,
				user.password
			)

			if (!isPasswordValid) {
				return { error: 'invalid_credentials' }
			}

			// Обновляем время последнего входа
			await prisma.user.update({
				where: { id: user.id },
				data: { lastLoginAt: new Date() },
			})

			// Создаем токены
			const tokens = await this.createTokenPair(
				user.id,
				user.phoneNormalized ?? user.phone,
				deviceInfo
			)

			return {
				user: {
					id: user.id,
					phone: user.phone,
					phoneNormalized: user.phoneNormalized,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					isVerified: user.isVerified,
					createdAt: user.createdAt,
					role: user.role,
				},
				tokens,
				message: 'success_login',
			}
		} catch (error) {
			if (this.isDatabaseConnectionError(error)) {
				console.error(
					'[AuthService] Database connection error in adminLogin:',
					error
				)
				return {
					error: 'database_unavailable',
					message:
						'Database is temporarily unavailable. Please try again later.',
				}
			}
			console.error('Error in adminLogin:', error)
			return { error: 'login_failed' }
		}
	}
}

export const authService = new AuthService()

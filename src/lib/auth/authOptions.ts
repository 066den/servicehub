import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validatePhone, normalizePhone } from '@/utils/phoneUtils'
import { authService } from '@/services/authService'
import { JWT } from 'next-auth/jwt'

if (!process.env.NEXTAUTH_SECRET) {
	console.warn(
		'⚠️  NEXTAUTH_SECRET не установлен. Это может вызвать проблемы с аутентификацией.'
	)
}

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			id: 'sms-login',
			name: 'TurboSMS',
			credentials: {
				phone: { label: 'Phone', type: 'text' },
				code: { label: 'Code', type: 'text' },
				firstName: { label: 'First Name', type: 'text' },
				lastName: { label: 'Last Name', type: 'text' },
				step: { label: 'Step', type: 'text' }, //'send-code' or 'verify-code'
			},
			async authorize(credentials, req) {
				if (!credentials?.phone) {
					return null
				}
				if (!validatePhone(credentials.phone)) {
					return null
				}

				const normalizedPhone = normalizePhone(credentials.phone)

				const headers = req?.headers || {}
				const deviceInfo = {
					ipAddress:
						headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
					userAgent: headers['user-agent'] || 'unknown',
					deviceId: headers['x-device-id'] || 'unknown',
				}

				try {
					if (credentials.step === 'send-code') {
						const result = await authService.sendVerificationCode(
							normalizedPhone,
							deviceInfo.ipAddress
						)
						
						// Если есть ошибка, но есть код, все равно возвращаем данные (код нужен для development режима)
						// Исключение: если это ошибка базы данных, выбрасываем ошибку
						if (result?.error && result.error === 'database_unavailable') {
							throw new Error(result.error)
						}

						// Если код есть, возвращаем данные (даже при ошибке отправки SMS)
						if (result?.code) {
							return {
								id: result?.userId?.toString() || '0',
								phone: credentials.phone,
								phoneNormalized: normalizedPhone,
								isVerified: false,
								code: result.code,
							}
						}

						// Если кода нет, это критическая ошибка
						if (result?.error) {
							throw new Error(result.error)
						}

						throw new Error('Failed to send verification code')
					}

					if (credentials.step === 'verify-code') {
						if (!credentials.code) {
							throw new Error('Code is required')
						}

						const result = await authService.verifyCode(
							credentials.phone,
							credentials.code,
							deviceInfo,
							credentials.firstName,
							credentials.lastName
						)

						if (result?.error) {
							throw new Error(result.error)
						}

						if (!result.user || !result.user.phoneNormalized) {
							throw new Error('User not found')
						}

						return {
							id: result.user.id.toString(),
							phone: result.user.phone,
							phoneNormalized: result.user.phoneNormalized,
							lastName: result.user.lastName,
							firstName: result.user.firstName,
							role: result.user.role,
							isVerified: result.user.isVerified,
							createdAt: result.user.createdAt,
							accessToken: result.tokens.accessToken,
							refreshToken: result.tokens.refreshToken,
						}
					}

					throw new Error('Invalid step')
				} catch (error) {
					console.error('Auth error:', error)
					throw new Error(
						error instanceof Error ? error.message : 'Authentication failed'
					)
				}
			},
		}),
		CredentialsProvider({
			id: 'admin-login',
			name: 'Admin Login',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const headers = req?.headers || {}
				const deviceInfo = {
					ipAddress:
						headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
					userAgent: headers['user-agent'] || 'unknown',
					deviceId: headers['x-device-id'] || 'unknown',
				}

				try {
					const result = await authService.adminLogin(
						credentials.email,
						credentials.password,
						deviceInfo
					)

					if (result?.error) {
						throw new Error(result.error)
					}

					if (!result.user || result.user.role !== 'ADMIN') {
						throw new Error('Access denied')
					}

					return {
						id: result.user.id.toString(),
						phone: result.user.phone || '',
						phoneNormalized: result.user.phoneNormalized || '',
						email: result.user.email || '',
						firstName: result.user.firstName,
						lastName: result.user.lastName || '',
						role: result.user.role,
						isVerified: result.user.isVerified,
						accessToken: result.tokens.accessToken,
						refreshToken: result.tokens.refreshToken,
					}
				} catch (error) {
					console.error('Admin auth error:', error)
					throw new Error(
						error instanceof Error ? error.message : 'Authentication failed'
					)
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = parseInt(user.id)
				token.phone = user.phone
				token.phoneNormalized = user.phoneNormalized
				token.isVerified = user.isVerified
				token.accessToken = user.accessToken
				token.role = user.role
				token.refreshToken = user.refreshToken
				if (process.env.NODE_ENV === 'development') {
					token.code = user.code
				}
				token.accessTokenExpires = Date.now() + 15 * 60 * 1000 // 15 минут
				return token
			}

			if (!token.id || token.id === 0) {
				return token
			}

			// Проверяем истечение access token (обновляем за 2 минуты до истечения)
			const expiresAt = token.accessTokenExpires || 0
			const now = Date.now()
			const timeUntilExpiry = expiresAt - now
			
			// Если токен еще действителен и не скоро истекает (более 2 минут), возвращаем как есть
			if (timeUntilExpiry > 2 * 60 * 1000) {
				return token
			}

			// Обновляем токен, если он истек или скоро истечет
			return await refreshAccessToken(token)
		},

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id
				session.user.phone = token.phone
				session.user.phoneNormalized = token.phoneNormalized
				session.user.isVerified = token.isVerified
				session.user.role = token.role
				session.accessToken = token.accessToken
				session.refreshToken = token.refreshToken
				// Передаем ошибку обновления токена в сессию для обработки на клиенте
				if ('error' in token && typeof token.error === 'string') {
					session.error = token.error
				}
				if (process.env.NODE_ENV === 'development' && token.code) {
					session.code = token.code
				}
			}

			return session
		},

		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) return `${baseUrl}${url}`
			if (new URL(url).origin === baseUrl) return url
			return baseUrl + '/'
		},
	},

	pages: {
		signIn: '/auth/signin',
	},

	events: {
		async signOut(message) {
			if (message.token?.id) {
				await authService.revokeAllUserTokens(message.token.id)
			}
		},
	},

	debug: process.env.NODE_ENV === 'development',
}

async function refreshAccessToken(token: JWT) {
	try {
		if (!token.refreshToken) {
			throw new Error('Нет refresh token')
		}

		const response = await authService.refreshAccessToken(
			token.refreshToken,
			{} // Пустой deviceInfo для обновления токена
		)

		return {
			...token,
			accessToken: response.tokens.accessToken,
			refreshToken: response.tokens.refreshToken,
			accessTokenExpires: response.tokens.accessTokenExpiresAt.getTime(),
			error: undefined,
		}
	} catch (error: unknown) {
		console.error('Ошибка обновления токена:', error)

		return {
			...token,
			error: 'RefreshAccessTokenError',
		}
	}
}

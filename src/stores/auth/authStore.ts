'use client'

import { create } from 'zustand'
import { UserProfile } from '@/types/auth'
import { useProviderStore } from '@/stores/provider/providerStore'
import { useCommonStore } from '@/stores/common/commonStore'
import { getSession, signIn, signOut } from 'next-auth/react'
import { Role } from '@prisma/client'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { WindowWithTimer } from '@/@types/global'
import { AuthStore } from './types'

const persistOptions: PersistOptions<
	AuthStore,
	Omit<AuthStore, 'actions' | 'isLoading'>
> = {
	name: 'auth-storage',
	partialize: state => {
		const { actions: _, isLoading: __, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		void __ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'auth-storage',
	name: 'authStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			(set, get) => ({
				user: null,
				isLoading: false,
				error: null,
				step: 'phone',
				phone: '',
				codeSent: false,
				codeExpiresAt: null,
				isRefreshing: false,
				refreshError: null,
				isLoadingProfile: false,
				profileError: null,
				lastProfileUpdate: 0,
				resendCountdown: 0,
				canResend: true,
				resendAttempts: 0,
				lastCodeSentAt: 0,
				isInitialized: false,

				actions: {
					setPhone: (phone: string) => set({ phone, error: null }),
					sendCode: async (phone: string) => {
						set({ error: null, isLoading: true })
						const {
							actions: { canResendCode, startResendTimer },
							resendCountdown,
							resendAttempts,
						} = get()
						try {
							if (!canResendCode()) {
								throw new Error(
									`Подождите ${resendCountdown} секунд перед повторной отправкой`
								)
							}

							const response = await signIn('sms-login', {
								phone,
								step: 'send-code',
								redirect: false,
							})
							if (response?.error) {
								set({ error: response.error })
								return
							}

							const now = Date.now()
							const currentAttempts = resendAttempts + 1

							set({
								phone,
								step: 'code',
								codeSent: true,
								codeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
								resendAttempts: currentAttempts,
								lastCodeSentAt: now,
							})

							const waitTime = Math.min(60 * currentAttempts, 300)
							startResendTimer(waitTime)
						} catch (error) {
							if (error instanceof Error) {
								set({ error: error.message })
							} else {
								set({ error: 'Failed to send code' })
							}
						} finally {
							set({ isLoading: false })
						}
					},

					verifyCode: async (
						code: string,
						firstName: string = '',
						lastName: string = ''
					) => {
						const {
							actions: { fetchUserProfile, resetResendTimer },
							phone,
						} = get()
						set({ isLoading: true, error: null })

						try {
							const response = await signIn('sms-login', {
								phone,
								code,
								firstName,
								lastName,
								step: 'verify-code',
								redirect: false,
							})
							if (response?.error) {
								set({ error: response.error })
							}

							if (response?.ok) {
								await new Promise(resolve => setTimeout(resolve, 500))

								const session = await getSession()

								if (session?.user && session.user.id > 0) {
									const fullUser = await fetchUserProfile(true)

									if (fullUser) {
										set({
											user: fullUser,
											step: 'success',
											isLoading: false,
											error: null,
										})

										// Загружаем провайдера, если роль пользователя PROVIDER
										if (fullUser.role === Role.PROVIDER) {
											const {
												actions: { fetchProvider },
											} = useProviderStore.getState()
											await fetchProvider(true).catch(error => {
												console.error('Ошибка загрузки провайдера:', error)
											})
										}
									} else {
										// Fallback to session data
										set({
											user: {
												id: session.user.id,
												phone: session.user.phone,
												phoneNormalized: session.user.phoneNormalized,
												isVerified: session.user.isVerified,
												isActive: true,
												createdAt: new Date().toISOString(),
												updatedAt: new Date().toISOString(),
												activeSessions: 1,
												activeTokens: 1,
												stats: {
													totalOrders: 0,
													completedOrders: 0,
													totalServices: 0,
													rating: 0,
													earnings: 0,
												},
											},
											step: 'success',
											isLoading: false,
											error: null,
										})
									}

									resetResendTimer()
								} else {
									throw new Error('Не удалось получить данные пользователя')
								}
							}
						} catch (error) {
							if (error instanceof Error) {
								set({ error: error.message })
							} else {
								set({ error: 'Failed to verify code' })
							}
						} finally {
							set({ isLoading: false })
						}
					},

					startResendTimer: (seconds: number = 60) => {
						set({ resendCountdown: seconds, canResend: false })
						const timer = setInterval(() => {
							const { resendCountdown } = get()
							if (resendCountdown <= 1) {
								clearInterval(timer)
								set({ resendCountdown, canResend: true })
							} else {
								set({ resendCountdown: resendCountdown - 1 })
							}
						}, 1000)

						if (typeof window !== 'undefined') {
							;(window as WindowWithTimer).resendTimer = timer
						}
					},

					stopResendTimer: () => {
						if (typeof window !== 'undefined') {
							const windowWithTimer = window as WindowWithTimer
							if (windowWithTimer.resendTimer) {
								clearInterval(windowWithTimer.resendTimer)
								windowWithTimer.resendTimer = undefined
							}
						}
						set({
							resendCountdown: 0,
							canResend: true,
						})
					},

					resetResendTimer: () => {
						const {
							actions: { stopResendTimer },
						} = get()
						stopResendTimer()
						set({
							resendCountdown: 0,
							canResend: true,
							resendAttempts: 0,
							lastCodeSentAt: 0,
						})
					},

					canResendCode: () => {
						const { canResend, resendCountdown, lastCodeSentAt } = get()
						if (!canResend && resendCountdown > 0) {
							return false
						}
						const now = Date.now()
						const timeSinceLastSend = now - lastCodeSentAt
						const minInterval = 60 * 1000
						return timeSinceLastSend >= minInterval
					},

					logout: async () => {
						set({ isLoading: true })
						const {
							actions: { stopResendTimer },
						} = get()

						const { clearProvider } = useProviderStore.getState().actions

						try {
							stopResendTimer()

							await signOut({ callbackUrl: '/auth/signin' })

							clearProvider()

							set({
								user: null,
								step: 'phone',
								phone: '',
								codeSent: false,
								codeExpiresAt: null,
								error: null,
								isLoading: false,
								profileError: null,
								lastProfileUpdate: 0,
								resendCountdown: 0,
								canResend: true,
								resendAttempts: 0,
								lastCodeSentAt: 0,
								isInitialized: false, // Сбрасываем для повторной инициализации при следующем логине
							})
						} catch (error) {
							if (error instanceof Error) {
								set({ error: error.message })
							} else {
								set({ error: 'Failed to logout' })
							}
						} finally {
							set({ isLoading: false })
						}
					},

					clearError: () => set({ error: null, refreshError: null }),

					setStep: (step: 'phone' | 'code' | 'success') => {
						const {
							actions: { resetResendTimer },
						} = get()
						if (step === 'phone') {
							resetResendTimer()
						}
						set({ step })
					},

					refreshSession: async (): Promise<boolean> => {
						const {
							actions: { logout },
							isRefreshing,
						} = get()

						if (isRefreshing) {
							return false
						}

						set({ isRefreshing: true, refreshError: null })

						try {
							// get current session
							const session = await getSession()

							if (!session?.refreshToken) {
								throw new Error('Нет refresh token')
							}

							// request to refresh token
							const response = await fetch('/api/auth/refresh', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									refreshToken: session.refreshToken,
								}),
							})

							if (!response.ok) {
								throw new Error('Ошибка обновления токена')
							}

							const data = await response.json()

							// update user in store
							set({
								user: data.user,
								isRefreshing: false,
								refreshError: null,
							})

							return true
						} catch (error) {
							console.error('Ошибка refresh токена:', error)

							let errorMessage = 'Неизвестная ошибка'
							if (error instanceof Error) {
								errorMessage = error.message
							} else if (typeof error === 'string') {
								errorMessage = error
							}

							set({
								refreshError: errorMessage,
								isRefreshing: false,
							})

							// if refresh failed, logout
							await logout()
							return false
						}
					},

					handleTokenExpiry: async () => {
						const {
							actions: { refreshSession },
						} = get()
						const success = await refreshSession()

						if (!success) {
							// if refresh failed, redirect to login
							window.location.href = '/auth/signin?expired=1'
						}
					},

					initialize: async (
						sessionStatus?: 'authenticated' | 'unauthenticated' | 'loading'
					) => {
						const {
							actions: { fetchUserProfile, handleTokenExpiry },
							isInitialized,
							user,
						} = get()

						set({ isLoading: true })

						try {
							// Для неавторизованных пользователей сразу завершаем инициализацию без запроса
							if (sessionStatus === 'unauthenticated') {
								// Если был пользователь, очищаем данные
								if (user) {
									set({
										user: null,
										isInitialized: true,
										isLoading: false,
									})
									// Очищаем провайдера
									const { clearProvider } = useProviderStore.getState().actions
									clearProvider()
								} else {
									set({ isInitialized: true, isLoading: false })
								}
								return
							}

							const session = await getSession()

							if (
								session?.user &&
								session.user.id > 0 &&
								session.user.isVerified
							) {
								// Проверяем, изменился ли пользователь
								const userIdChanged = user && user.id !== session.user.id

								// Если пользователь изменился, сбрасываем инициализацию и очищаем данные
								if (userIdChanged) {
									set({
										user: null,
										isInitialized: false,
										lastProfileUpdate: 0,
									})
									// Очищаем провайдера при смене пользователя
									const { clearProvider } = useProviderStore.getState().actions
									clearProvider()
								}

								// Если уже инициализировано и пользователь не изменился, просто выходим
								if (isInitialized && !userIdChanged) {
									set({ isLoading: false })
									return
								}

								// check if there is an error with the token
								if (session.error === 'RefreshAccessTokenError') {
									await handleTokenExpiry()
									return
								}

								const fullUser = await fetchUserProfile(true)

								if (fullUser) {
									set({
										user: fullUser,
										step: 'success',
										isInitialized: true,
										isLoading: false,
									})

									// Загружаем провайдера асинхронно, чтобы не блокировать инициализацию
									if (fullUser.role === Role.PROVIDER) {
										const {
											actions: { fetchProvider },
										} = useProviderStore.getState()
										// Загружаем в фоне, не блокируя инициализацию
										fetchProvider(true).catch(error => {
											console.error('Ошибка загрузки провайдера:', error)
										})
									}
								} else {
									set({
										user: {
											id: session.user.id,
											phone: session.user.phone,
											phoneNormalized: session.user.phoneNormalized,
											isVerified: session.user.isVerified,
											isActive: true,
											createdAt: new Date().toISOString(),
											updatedAt: new Date().toISOString(),
											activeSessions: 1,
											activeTokens: 1,
											stats: {
												totalOrders: 0,
												completedOrders: 0,
												totalServices: 0,
												rating: 0,
												earnings: 0,
											},
										},
										step: 'success',
										isInitialized: true,
										isLoading: false,
									})
								}
							} else {
								set({ isInitialized: true, isLoading: false })
							}
						} catch (error) {
							console.error('Ошибка инициализации авторизации:', error)
							set({ isInitialized: true, isLoading: false })
						} finally {
							set({ isLoading: false })
						}
					},

					fetchUserProfile: async (
						force = false
					): Promise<UserProfile | null> => {
						const { lastProfileUpdate, user } = get()

						const now = Date.now()
						if (!force && now - lastProfileUpdate < 5 * 60 * 1000) {
							return user
						}

						if (!user) {
							set({ isLoadingProfile: true })
						}

						set({ profileError: null })

						try {
							const session = await getSession()

							if (!session?.accessToken) {
								throw new Error('Not access token')
							}

							const response = await fetch('/api/user/profile', {
								headers: {
									Authorization: `Bearer ${session.accessToken}`,
									'Content-Type': 'application/json',
								},
							})

							if (!response.ok) {
								const errorData = await response.json().catch(() => ({}))
								throw new Error(errorData.error || `HTTP ${response.status}`)
							}

							const data = await response.json()

							if (!data.success || !data.user) {
								throw new Error(data.error || 'Failed to fetch user profile')
							}

							const profile: UserProfile = data.user

							set({
								user: profile,
								isLoadingProfile: false,
								lastProfileUpdate: now,
							})

							// Синхронизация локации: если в профиле есть локация - обновляем commonLocation
							if (profile.location && profile.location.city) {
								const {
									actions: { setCommonLocation },
								} = useCommonStore.getState()
								setCommonLocation(profile.location)
							}

							// Загружаем провайдера асинхронно, если роль пользователя PROVIDER
							if (profile.role === Role.PROVIDER) {
								const {
									actions: { fetchProvider },
								} = useProviderStore.getState()
								// Загружаем в фоне, не блокируя ответ
								fetchProvider(true).catch(error => {
									console.error('Ошибка загрузки провайдера:', error)
								})
							}

							return profile
						} catch (error) {
							let message = 'Ошибка загрузки профиля'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								profileError: message,
								isLoadingProfile: false,
							})

							return null
						}
					},

					updateUser: async (updates: Partial<UserProfile>) => {
						const { user } = get()
						const session = await getSession()
						if (!user) {
							throw new Error('User not found')
						}

						if (!session?.accessToken) {
							throw new Error('Not access token')
						}

						// Синхронизация локации: если обновляется location, также обновляем commonLocation
						if (updates.location) {
							const {
								actions: { setCommonLocation },
							} = useCommonStore.getState()
							setCommonLocation(updates.location)
						}

						set({
							user: {
								...user,
								...updates,
								updatedAt: new Date().toISOString(),
							},
						})

						try {
							const response = await fetch('/api/user/profile', {
								method: 'PUT',
								headers: {
									Authorization: `Bearer ${session.accessToken}`,
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(updates),
							})

							if (!response.ok) {
								const errorData = await response.json().catch(() => ({}))
								throw new Error(errorData.error || `HTTP ${response.status}`)
							}
						} catch (error) {
							set({ user })
							if (error instanceof Error) {
								console.error('Error updateUser:', error.message)
								throw new Error(error.message)
							}
						}
					},

					refreshUserProfile: async () => {
						const {
							actions: { fetchUserProfile },
						} = get()
						await fetchUserProfile(true)
					},

					uploadAvatar: async (file: File) => {
						const {
							actions: { refreshUserProfile },
						} = get()

						try {
							const session = await getSession()
							if (!session?.accessToken) {
								throw new Error('Unauthorized')
							}

							const formData = new FormData()
							formData.append('avatar', file)

							const response = await fetch('/api/user/avatar', {
								method: 'POST',
								headers: {
									Authorization: `Bearer ${session.accessToken}`,
								},
								body: formData,
							})

							if (!response.ok) {
								const errorData = await response.json().catch(() => ({}))
								throw new Error(errorData.error || `HTTP ${response.status}`)
							}

							const data = await response.json()
							if (data.success) {
								await refreshUserProfile()
							} else {
								throw new Error(data.error || 'Failed to upload avatar')
							}
						} catch (error) {
							console.error('Error uploadAvatar:', error)
						}
					},

					removeAvatar: async () => {
						const {
							actions: { refreshUserProfile },
						} = get()
						const session = await getSession()
						if (!session?.accessToken) {
							throw new Error('Unauthorized')
						}

						try {
							const response = await fetch('/api/user/avatar', {
								method: 'DELETE',
								headers: {
									Authorization: `Bearer ${session.accessToken}`,
									'Content-Type': 'application/json',
								},
							})

							if (!response.ok) {
								const errorData = await response.json().catch(() => ({}))
								throw new Error(errorData.error || `HTTP ${response.status}`)
							}

							const data = await response.json()
							if (data.success) {
								await refreshUserProfile()
							} else {
								throw new Error(data.error || 'Failed to remove avatar')
							}
						} catch (error) {
							console.error('Error removeAvatar:', error)
						}
					},
				},
			}),
			persistOptions
			// {
			// 	name: 'auth-storage',
			// 	partialize: state => ({
			// 		user: state.user,
			// 		phone: state.phone,
			// 		step: state.step,
			// 		lastProfileUpdate: state.lastProfileUpdate,
			// 		lastCodeSentAt: state.lastCodeSentAt,
			// 		resendAttempts: state.resendAttempts,
			// 		canResend: state.canResend,
			// 		isInitialized: state.isInitialized,
			// 	}),
			// 	storage: createJSONStorage(() => {
			// 		if (typeof window !== 'undefined') {
			// 			return localStorage
			// 		}
			// 		return {
			// 			getItem: () => null,
			// 			setItem: () => {},
			// 			removeItem: () => {},
			// 		}
			// 	}),
			// }
		),
		devtoolsOptions
	)
)

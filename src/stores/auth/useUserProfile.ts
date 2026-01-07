import { useAuthStore } from '@/stores/auth/authStore'
import {
	authActionsSelector,
	authCanResendSelector,
	authIsInitializedSelector,
	authIsLoadingProfileSelector,
	authIsLoadingSelector,
	authPhoneSelector,
	authProfileErrorSelector,
	authResendAttemptsSelector,
	authResendCountdownSelector,
	authUserSelector,
} from '@/stores/auth/selectors'
import { getDisplayName } from '@/utils/textFormat'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

export const useUserProfile = () => {
	const { status } = useSession()

	const user = useAuthStore(authUserSelector)
	const isLoading = useAuthStore(authIsLoadingSelector)
	const isLoadingProfile = useAuthStore(authIsLoadingProfileSelector)
	const profileError = useAuthStore(authProfileErrorSelector)
	const isInitialized = useAuthStore(authIsInitializedSelector)
	const phone = useAuthStore(authPhoneSelector)
	const resendCountdown = useAuthStore(authResendCountdownSelector)
	const canResend = useAuthStore(authCanResendSelector)
	const resendAttempts = useAuthStore(authResendAttemptsSelector)
	//actions
	const actions = useAuthStore(authActionsSelector)
	const { logout, fetchUserProfile, refreshUserProfile } = actions
	const logoutRef = useRef(logout)

	// Обновляем ref при изменении logout
	useEffect(() => {
		logoutRef.current = logout
	}, [logout])

	// Обрабатываем изменения статуса аутентификации
	useEffect(() => {
		if (status === 'unauthenticated' && user) {
			logoutRef.current()
		}
		// Убрали дублирующую инициализацию - она теперь только в AuthProvider
	}, [status, user])

	// Оптимизация: для неавторизованных пользователей не показываем loading после инициализации
	// Показываем loading только если:
	// 1. Еще не инициализировано
	// 2. Инициализация в процессе
	// 3. Загружается профиль для авторизованного пользователя
	// НЕ показываем loading если инициализировано и пользователь не авторизован
	const shouldShowLoading = 
		!isInitialized || // Пока не инициализировано
		isLoading || // Инициализация в процессе
		(isLoadingProfile && user) // Загрузка профиля для авторизованного пользователя

	return {
		user,
		phone,
		isAuthenticated: !!user && status === 'authenticated',
		isLoading: shouldShowLoading,
		error: profileError,
		isInitialized,
		resendCountdown,
		canResend,
		resendAttempts,
		...actions,

		fetchProfile: fetchUserProfile,
		refreshProfile: refreshUserProfile,

		isVerified: user?.isVerified || false,
		...(user && { displayName: getDisplayName(user) }),
		hasCompletedProfile: !!(user?.firstName && user?.lastName),
		userLocation: user?.location || null,

		stats: user?.stats || {
			totalOrders: 0,
			completedOrders: 0,
			totalServices: 0,
			rating: 0,
			earnings: 0,
		},
	}
}

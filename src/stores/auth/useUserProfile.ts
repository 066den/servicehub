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
import { useEffect } from 'react'

export const useUserProfile = () => {
	const { data: session, status } = useSession()

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
	const { initialize, logout, fetchUserProfile, refreshUserProfile } = actions

	useEffect(() => {
		if (status !== 'loading' && !isInitialized) {
			initialize()
		}
	}, [status, isInitialized, initialize])

	useEffect(() => {
		if (status === 'authenticated' && session?.user && !user) {
			initialize()
		} else if (status === 'unauthenticated' && user) {
			logout()
		}
	}, [session, status, user, initialize, logout])

	return {
		user,
		phone,
		isAuthenticated: !!user && status === 'authenticated',
		isLoading: isLoading || isLoadingProfile || status === 'loading',
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

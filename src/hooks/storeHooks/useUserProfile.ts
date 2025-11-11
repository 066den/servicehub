import { useAuthStore } from '@/stores/authStore'
import { getDisplayName } from '@/utils/textFormat'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const useUserProfile = () => {
	const { data: session, status } = useSession()
	const {
		user,
		isLoading,
		isLoadingProfile,
		profileError,
		isInitialized,
		setPhone,
		sendCode,
		fetchUserProfile,
		refreshUserProfile,
		updateUser,
		initialize,
		logout,
		uploadAvatar,
		removeAvatar,
	} = useAuthStore()

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
		isAuthenticated: !!user && status === 'authenticated',
		isLoading: isLoading || isLoadingProfile || status === 'loading',
		error: profileError,

		fetchProfile: fetchUserProfile,
		refreshProfile: refreshUserProfile,
		updateUser,
		setPhone,
		sendCode,
		uploadAvatar,
		removeAvatar,

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

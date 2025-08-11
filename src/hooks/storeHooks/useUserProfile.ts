import { useAuthStore } from '@/stores/authStore'
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
		fetchUserProfile,
		refreshUserProfile,
		updateUser,
		initialize,
		logout,
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

		isVerified: user?.isVerified || false,
		displayName: user?.displayName || 'Пользователь',
		hasCompletedProfile: !!(user?.firstName && user?.lastName),

		stats: user?.stats || {
			totalOrders: 0,
			completedOrders: 0,
			totalServices: 0,
			rating: 0,
			earnings: 0,
		},
	}
}

import { useAuthStore } from '@/stores/authStore'

export const useUserProfile = () => {
	const {
		user,
		isLoadingProfile,
		profileError,
		fetchUserProfile,
		refreshUserProfile,
		updateLocalUser,
	} = useAuthStore()

	return {
		user,
		isLoading: isLoadingProfile,
		error: profileError,

		// Методы
		fetchProfile: fetchUserProfile,
		refreshProfile: refreshUserProfile,
		updateUser: updateLocalUser,

		// Вычисляемые свойства
		isVerified: user?.isVerified || false,
		displayName: user?.displayName || 'Пользователь',
		hasCompletedProfile: !!(user?.firstName && user?.lastName),

		// Статистика
		stats: user?.stats || {
			totalOrders: 0,
			completedOrders: 0,
			totalServices: 0,
			rating: 0,
			earnings: 0,
		},
	}
}

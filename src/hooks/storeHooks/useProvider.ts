import { useProviderStore } from '@/stores/providerStore'

export const useProvider = () => {
	const {
		provider,
		providerError,
		createProvider,
		updateProvider,
		isLoadingProvider,
		uploadAvatar,
		removeAvatar,
		fetchProvider,
	} = useProviderStore()

	const isProvider = !!provider
	const providerLocation = provider?.location || null
	return {
		provider,
		providerError,
		createProvider,
		updateProvider,
		isLoadingProvider,
		uploadAvatar,
		removeAvatar,
		fetchProvider,
		isProvider,
		providerLocation,
	}
}

import { useProviderStore } from '@/stores/providerStore'

export const useProvider = () => {
	const { provider, providerError, createProvider, isLoadingProvider } =
		useProviderStore()

	const isProvider = !!provider

	return {
		provider,
		providerError,
		createProvider,
		isLoadingProvider,
		isProvider,
	}
}

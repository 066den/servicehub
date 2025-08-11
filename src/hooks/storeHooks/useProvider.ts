import { useProviderStore } from '@/stores/providerStore'

export const useProvider = () => {
	const { provider, providerError, createProvider } = useProviderStore()

	return { provider, providerError, createProvider }
}

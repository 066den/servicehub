import { useProviderStore } from '@/stores/provider/providerStore'
import {
	providerActionsSelector,
	providerErrorSelector,
	providerIsLoadingSelector,
	providerSelector,
} from './selectors'

export const useProvider = () => {
	const provider = useProviderStore(providerSelector)
	const providerError = useProviderStore(providerErrorSelector)
	const isLoadingProvider = useProviderStore(providerIsLoadingSelector)
	//actions
	const actions = useProviderStore(providerActionsSelector)

	const isProvider = !!provider
	const providerLocation = provider?.location || null
	return {
		provider,
		providerError,
		isLoadingProvider,
		isProvider,
		providerLocation,
		...actions,
	}
}

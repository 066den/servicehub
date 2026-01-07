import { useProviderServiceStore } from './providerServiceStore'

export const useProviderService = () => {
	const services = useProviderServiceStore(state => state.services)
	const currentService = useProviderServiceStore(state => state.currentService)
	const isLoading = useProviderServiceStore(state => state.isLoading)
	const error = useProviderServiceStore(state => state.error)
	const actions = useProviderServiceStore(state => state.actions)

	return {
		services,
		currentService,
		isLoading,
		error,
		...actions,
	}
}

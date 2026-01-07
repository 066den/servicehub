import { usePremiumServiceStore } from './premiumServiceStore'

export const usePremiumService = () => {
	const premiumServices = usePremiumServiceStore(
		state => state.premiumServices
	)
	const activeServices = usePremiumServiceStore(state => state.activeServices)
	const isLoading = usePremiumServiceStore(state => state.isLoading)
	const error = usePremiumServiceStore(state => state.error)
	const actions = usePremiumServiceStore(state => state.actions)

	return {
		premiumServices,
		activeServices,
		isLoading,
		error,
		...actions,
	}
}


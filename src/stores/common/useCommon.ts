import { useCommonStore } from '@/stores/common/commonStore'
import {
	commonActionsSelector,
	statsSelector,
	isLoadingSelector,
	errorSelector,
	lastStatsUpdateSelector,
} from './selectors'

export const useCommon = () => {
	// State
	const stats = useCommonStore(statsSelector)
	const isLoading = useCommonStore(isLoadingSelector)
	const error = useCommonStore(errorSelector)
	const lastStatsUpdate = useCommonStore(lastStatsUpdateSelector)

	// Actions
	const actions = useCommonStore(commonActionsSelector)

	// Computed values
	const hasStats = stats !== null

	return {
		// State
		stats,
		isLoading,
		error,
		lastStatsUpdate,

		// Computed
		hasStats,

		// Actions
		...actions,
	}
}


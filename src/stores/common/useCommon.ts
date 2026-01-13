import { useCommonStore } from '@/stores/common/commonStore'
import {
	commonActionsSelector,
	statsSelector,
	isLoadingSelector,
	errorSelector,
	lastStatsUpdateSelector,
	commonLocationSelector,
} from './selectors'

export const useCommon = () => {
	// State
	const stats = useCommonStore(statsSelector)
	const isLoading = useCommonStore(isLoadingSelector)
	const error = useCommonStore(errorSelector)
	const lastStatsUpdate = useCommonStore(lastStatsUpdateSelector)
	const commonLocation = useCommonStore(commonLocationSelector)
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
		commonLocation,
		// Computed
		hasStats,

		// Actions
		...actions,
	}
}

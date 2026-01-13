import { useAdminStore } from '@/stores/admin/adminStore'
import {
	adminActionsSelector,
	isLoadingSelector,
	errorSelector,
} from './selectors'

export const useAdmin = () => {
	// State
	const isLoading = useAdminStore(isLoadingSelector)
	const error = useAdminStore(errorSelector)

	// Actions
	const actions = useAdminStore(adminActionsSelector)

	return {
		// State
		isLoading,
		error,

		// Actions
		...actions,
	}
}


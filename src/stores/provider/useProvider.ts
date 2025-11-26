import { useProviderStore } from '@/stores/provider/providerStore'
import {
	providerActionsSelector,
	providerErrorSelector,
	providerIsLoadingSelector,
	providerSelector,
	staffSelector,
	staffIsLoadingSelector,
	staffErrorSelector,
} from './selectors'
import { Executor } from '@/types/auth'

export const useProvider = () => {
	const provider: Executor | null = useProviderStore(providerSelector)
	const providerError = useProviderStore(providerErrorSelector)
	const isLoadingProvider = useProviderStore(providerIsLoadingSelector)
	const staff = useProviderStore(staffSelector)
	const isLoadingStaff = useProviderStore(staffIsLoadingSelector)
	const staffError = useProviderStore(staffErrorSelector)
	//actions
	const actions = useProviderStore(providerActionsSelector)

	const isProvider = !!provider
	const providerLocation = provider?.location || null

	// Обертка для uploadStaffAvatar, которая обновляет состояние после загрузки
	const uploadStaffAvatar = async (id: number, file: File) => {
		await actions.uploadStaffAvatar(id, file)
		// uploadStaffAvatar уже обновляет staff в store, fetchStaff не нужен
	}

	// Извлекаем uploadStaffAvatar из actions, чтобы заменить на обертку
	const { uploadStaffAvatar: _uploadStaffAvatar, ...restActions } = actions
	void _uploadStaffAvatar // Явно помечаем как неиспользуемый

	return {
		provider,
		providerError,
		isLoadingProvider,
		isProvider,
		providerLocation,
		staff,
		isLoadingStaff,
		staffError,
		...restActions,
		uploadStaffAvatar,
	}
}

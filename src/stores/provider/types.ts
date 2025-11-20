import { ChangeProviderTypeSchema, UpdateProviderSchema } from '@/lib/schemas'
import { Executor } from '@/types/auth'

export interface ProviderState {
	provider: Executor | null
	lastProviderUpdate: number
	isLoadingProvider: boolean
	providerError: string | null
}

export interface ProviderActions {
	fetchProvider: (force?: boolean) => Promise<Executor | null>
	createProvider: (provider: Executor) => void
	updateProvider: (provider: UpdateProviderSchema) => void
	changeProviderType: (type: ChangeProviderTypeSchema['type']) => Promise<void>
	uploadAvatar: (file: File) => Promise<void>
	removeAvatar: () => Promise<void>
	clearProvider: () => void
}

export interface ProviderStore extends ProviderState {
	actions: ProviderActions
}

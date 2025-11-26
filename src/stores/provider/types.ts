import { ChangeProviderTypeSchema, UpdateProviderSchema } from '@/lib/schemas'
import { Executor } from '@/types/auth'
import { StaffMember } from '@/types'

export interface ProviderState {
	provider: Executor | null
	lastProviderUpdate: number
	isLoadingProvider: boolean
	providerError: string | null
	staff: StaffMember[]
	isLoadingStaff: boolean
	staffError: string | null
	lastStaffUpdate: number
}

export interface ProviderActions {
	fetchProvider: (force?: boolean) => Promise<Executor | null>
	createProvider: (provider: Executor) => void
	updateProvider: (provider: UpdateProviderSchema) => void
	changeProviderType: (type: ChangeProviderTypeSchema['type']) => Promise<void>
	uploadAvatar: (file: File) => Promise<void>
	removeAvatar: () => Promise<void>
	clearProvider: () => void
	fetchStaff: (force?: boolean) => Promise<StaffMember[] | null>
	updateStaff: (
		id: number,
		data: { phone?: string; position?: string; role?: string; status?: string },
		skipLoading?: boolean
	) => Promise<StaffMember | null>
	uploadStaffAvatar: (id: number, file: File) => Promise<void>
	removeStaffAvatar: (id: number) => Promise<void>
	deleteStaff: (id: number) => Promise<boolean>
	clearStaff: () => void
}

export interface ProviderStore extends ProviderState {
	actions: ProviderActions
}

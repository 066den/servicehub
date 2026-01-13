import { LocationData } from '@/types'

export interface Stats {
	categoriesCount: number
	servicesCount: number
	performersCount: number
	clientsCount: number
	typesCount: number
}

export interface CommonState {
	stats: Stats | null
	isLoading: boolean
	error: string | null
	lastStatsUpdate: number
	commonLocation: LocationData | null
	skipped: Skipped
}

export interface Skipped {
	location: boolean
}

export interface CommonActions {
	fetchStats: (force?: boolean) => Promise<void>
	clearStats: () => void
	setCommonLocation: (location: LocationData | null) => void
}

export interface CommonStore extends CommonState {
	actions: CommonActions
}

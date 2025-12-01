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
}

export interface CommonActions {
	fetchStats: (force?: boolean) => Promise<void>
	clearStats: () => void
}

export interface CommonStore extends CommonState {
	actions: CommonActions
}


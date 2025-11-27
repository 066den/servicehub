export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	EXECUTOR: '/profile/executor',
	DASHBOARD: '/profile/dashboard',
	MY_RECORDS: '/profile/records',
	MY_REVIEWS: '/profile/reviews',
	MY_ORDERS: '/profile/orders',
	FAVORITES: '/profile/favorites',
	SETTINGS: '/settings',
	STAFF: '/profile/staff',
	SERVICES: '/profile/services',
	STAFF_PROFILE: (id: number) => `/profile/staff/${id}`,
} as const

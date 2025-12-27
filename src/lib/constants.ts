export const ROUTES = {
	HOME: '/',
	PROFILE: '/profile',
	ABOUT_US: '/about',
	EXECUTOR: '/profile/executor',
	DASHBOARD: '/profile/dashboard',
	MY_RECORDS: '/profile/records',
	MY_REVIEWS: '/profile/reviews',
	MY_ORDERS: '/profile/orders',
	FAVORITES: '/profile/favorites',
	SETTINGS: '/settings',
	STAFF: '/profile/staff',
	SERVICES: '/profile/services',
	PREMIUM_SERVICES: '/profile/premium-services',
	STAFF_PROFILE: (id: number) => `/profile/staff/${id}`,
	EXECUTOR_PUBLIC: (slug: string) => `/${slug}`,
	CATELOG: '/catalog',
	SERVICE_PUBLIC: (executorSlug: string, id: number) =>
		`/${encodeURIComponent(executorSlug)}/${id}`,
	//ADMIN
	ADMIN: {
		CATEGORIES: '/admin/categories',
		SERVICE_TYPES: '/admin/service-types',
		SERVICES: '/admin/services',
		ORDERS: '/admin/orders',
		REVIEWS: '/admin/reviews',
		USERS: '/admin/users',
		SETTINGS: '/admin/settings',
		STAFF: '/admin/staff',
		STAFF_PROFILE: (id: number) => `/admin/staff/${id}`,
	},
} as const

export const ERROR_MESSAGES = {
	PRISMA: {
		NOT_INITIALIZED: 'Prisma is not initialized',
	},
} as const

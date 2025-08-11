'use client'
import SidebarSection from '../common/SidebarSection'
import { ERoutes } from '@/types/enum'
import { signOut } from 'next-auth/react'

import './Sidebar.scss'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { Role } from '@prisma/client'

const dashboardItems = [
	{
		icon: '📊',
		label: 'home',
		href: ERoutes.DASHBOARD,
	},
]

const profileItems = [
	{
		icon: '👤',
		label: 'profile',
		href: ERoutes.PROFILE,
	},
	{
		icon: '📋',
		label: 'myOrders',
		href: ERoutes.MY_ORDERS,
	},
	{
		icon: '📅',
		label: 'myRecords',
		href: ERoutes.MY_RECORDS,
	},
	{
		icon: '❤️',
		label: 'favorites',
		href: ERoutes.FAVORITES,
	},
	{
		icon: '⭐',
		label: 'myReviews',
		href: ERoutes.MY_REVIEWS,
	},
]

const settingsItems = [
	{
		icon: '⚙️',
		label: 'settings',
		href: ERoutes.SETTINGS,
	},
	{
		icon: '🚪',
		label: 'logout',
		action: () => {
			signOut()
		},
	},
]

const Sidebar = () => {
	const { user } = useUserProfile()
	const isProvider = user?.role === Role.PROVIDER
	return (
		<aside className='sidebar'>
			{isProvider && (
				<SidebarSection title='dashboard' items={dashboardItems} />
			)}
			<SidebarSection title='account' items={profileItems} />
			<SidebarSection title='settings' items={settingsItems} />
		</aside>
	)
}

export default Sidebar

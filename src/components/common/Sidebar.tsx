'use client'
import { ERoutes } from '@/types/enum'
import { signOut } from 'next-auth/react'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { Role } from '@prisma/client'
import SidebarSection from './SidebarSection'
import { Card } from '../ui/card'

const dashboardItems = [
	{
		icon: '📊',
		title: 'home',
		url: ERoutes.DASHBOARD,
	},
]

const profileItems = [
	{
		icon: '👤',
		title: 'profile',
		url: ERoutes.PROFILE,
	},
	{
		icon: '📋',
		title: 'myOrders',
		url: ERoutes.MY_ORDERS,
	},
	{
		icon: '📅',
		title: 'myRecords',
		url: ERoutes.MY_RECORDS,
	},
	{
		icon: '❤️',
		title: 'favorites',
		url: ERoutes.FAVORITES,
	},
	{
		icon: '⭐',
		title: 'myReviews',
		url: ERoutes.MY_REVIEWS,
	},
]

const settingsItems = [
	{
		icon: '⚙️',
		title: 'settings',
		url: ERoutes.SETTINGS,
	},
	{
		icon: '🚪',
		title: 'logout',
		action: () => {
			signOut()
		},
	},
]

const Sidebar = () => {
	const { user } = useUserProfile()

	const isProvider = user?.role === Role.PROVIDER
	return (
		<Card className='sticky top-20 h-fit'>
			{isProvider && (
				<SidebarSection title='dashboard' items={dashboardItems} />
			)}
			<SidebarSection title='account' items={profileItems} />
			<SidebarSection title='settings' items={settingsItems} />
		</Card>
	)
}

export default Sidebar

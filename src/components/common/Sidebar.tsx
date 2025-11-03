'use client'
import { ROUTES } from '@/lib/constants'
import { signOut } from 'next-auth/react'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { Role } from '@prisma/client'
import SidebarSection from './SidebarSection'
import { Card } from '../ui/card'
import {
	Calendar,
	Heart,
	ShoppingBag,
	Star,
	User,
	Settings,
	Home,
	LogOut,
} from 'lucide-react'

const dashboardItems = [
	{
		icon: <Home className='size-5' />,
		title: 'home',
		url: ROUTES.DASHBOARD,
	},
]

const profileItems = [
	{
		icon: <User className='size-5' />,
		title: 'profile',
		url: ROUTES.PROFILE,
	},
	{
		icon: <ShoppingBag className='size-5' />,
		title: 'myOrders',
		url: ROUTES.MY_ORDERS,
	},
	{
		icon: <Calendar className='size-5' />,
		title: 'myRecords',
		url: ROUTES.MY_RECORDS,
	},
	{
		icon: <Heart className='size-5' />,
		title: 'favorites',
		url: ROUTES.FAVORITES,
	},
	{
		icon: <Star className='size-5' />,
		title: 'myReviews',
		url: ROUTES.MY_REVIEWS,
	},
]

const settingsItems = [
	{
		icon: <Settings className='size-5' />,
		title: 'settings',
		url: ROUTES.SETTINGS,
	},
	{
		icon: <LogOut className='size-5' />,
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

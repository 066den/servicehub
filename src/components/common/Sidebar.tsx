'use client'
import { ROUTES } from '@/lib/constants'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { ProviderType, Role } from '@prisma/client'
import SidebarSection from './SidebarSection'
import { Card } from '../ui/card'
import {
	Calendar,
	Heart,
	ShoppingBag,
	Star,
	User,
	Settings,
	LogOut,
	Briefcase,
	Building,
} from 'lucide-react'
import { useProvider } from '@/stores/provider/useProvider'

const providerItems = [
	{
		icon: <Briefcase className='size-5' />,
		title: 'profileExecutor',
		url: ROUTES.EXECUTOR,
	},
]

const companyItems = [
	{
		icon: <Building className='size-5' />,
		title: 'profileCompany',
		url: ROUTES.EXECUTOR,
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

const Sidebar = () => {
	const { user, isLoading, logout } = useUserProfile()
	const { provider } = useProvider()

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
				void logout()
			},
		},
	]

	const isProvider = user?.role === Role.PROVIDER

	return (
		<Card className='sticky top-20 h-fit'>
			{!isLoading &&
				isProvider &&
				(provider?.type === ProviderType.INDIVIDUAL ? (
					<SidebarSection title='dashboard' items={providerItems} />
				) : (
					<SidebarSection title='dashboard' items={companyItems} />
				))}

			<SidebarSection title='account' items={profileItems} />
			<SidebarSection title='settings' items={settingsItems} />
		</Card>
	)
}

export default Sidebar

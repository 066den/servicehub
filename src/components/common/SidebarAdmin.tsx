'use client'
import { ROUTES } from '@/lib/constants'
import SidebarSection from './SidebarSection'
import { Card, CardHeader } from '../ui/card'
import { Calendar, Heart, ShoppingBag, Star, User } from 'lucide-react'
import Logo from './Logo'

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
		icon: '📂',
		title: 'categories',
		url: ROUTES.ADMIN.CATEGORIES,
	},
	{
		icon: '🛠️',
		title: 'serviceTypes',
		url: ROUTES.ADMIN.SERVICE_TYPES,
	},
]

const SidebarAdmin = () => {
	return (
		<aside className='h-screen sticky top-0'>
			<Card className='overflow-y-auto h-full pt-0'>
				<CardHeader className='bg-primary text-white py-4'>
					<Logo size='sm' color='white' />
					<div className='text-sm font-bold py-1 px-3 rounded-full bg-white/20'>
						Адміністратор
					</div>
				</CardHeader>
				<SidebarSection title='account' items={profileItems} />
				<SidebarSection title='settings' items={settingsItems} />
			</Card>
		</aside>
	)
}

export default SidebarAdmin

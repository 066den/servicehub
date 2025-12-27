'use client'
import { ROUTES } from '@/lib/constants'
import SidebarSection from '../common/SidebarSection'
import { Card, CardHeader } from '../ui/card'
import { Calendar, Heart, ShoppingBag, Star, User, LogOut } from 'lucide-react'
import Logo from '../common/Logo'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import ConfirmDialog from '../modals/ConfirmDialog'
import useFlag from '@/hooks/useFlag'

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

const SidebarAdmin = () => {
	const { logout } = useUserProfile()
	const [isLogoutModalOpen, openLogoutModal, closeLogoutModal] = useFlag()

	const handleLogout = () => {
		void logout()
		closeLogoutModal()
	}

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
		{
			icon: <LogOut className='size-5' />,
			title: 'logout',
			action: () => {
				openLogoutModal()
			},
		},
	]

	return (
		<>
			<aside className='h-screen sticky top-0'>
				<Card className='overflow-y-auto h-full pt-0'>
					<CardHeader className='bg-primary text-white py-4'>
						<Logo size='sm' withImage={false} color='white' />
						<div className='text-sm font-bold py-1 px-3 rounded-full bg-white/20'>
							Адміністратор
						</div>
					</CardHeader>
					<SidebarSection title='account' items={profileItems} />
					<SidebarSection title='settings' items={settingsItems} />
				</Card>
			</aside>
			<ConfirmDialog
				title='Вийти'
				isOpen={isLogoutModalOpen}
				onClose={closeLogoutModal}
				onDestroy={handleLogout}
				onCancel={closeLogoutModal}
				destroyText='Вийти'
				text='Ви впевнені, що хочете вийти з аккаунту?'
				cancelText='Повернутися'
			/>
		</>
	)
}

export default SidebarAdmin

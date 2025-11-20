'use client'

import Navigation from '../common/Navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { bounceVariants } from '../ui/animate/variants'
import { useRouter } from 'next/navigation'
import Modal from '../modals/Modal'
import { Button } from '../ui/button'
import useFlag from '@/hooks/useFlag'
import LocationSelector from '../common/LocationSelector'
import Logo from '../common/Logo'
import Avatar from '../ui/Avatar'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { Skeleton } from '../ui/skeleton'
import { Bell } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useProvider } from '@/stores/provider/useProvider'
import { ProviderType } from '@prisma/client'
import AvatarCompany from '../ui/AvatarCompany'

const Header = () => {
	const t = useTranslations()

	const router = useRouter()
	const navigationItems = [
		{
			label: t('Link.services'),
			href: '/services',
		},
		{
			label: t('Link.about'),
			href: '/about',
		},
		{
			label: t('Link.contact'),
			href: '/contact',
		},
	]
	const { user, isLoading, logout } = useUserProfile()
	const { isProvider, provider } = useProvider()
	const [isModalProfileOpen, openModalProfile, closeModalProfile] = useFlag()

	const handleAvatarClick = () => {
		openModalProfile()
	}

	const handleCompanyProfileClick = () => {
		router.push(ROUTES.EXECUTOR)
	}

	const handleProfileClick = () => {
		router.push('/profile')
		closeModalProfile()
	}

	const handleLogout = async () => {
		try {
			await logout()
		} finally {
			closeModalProfile()
		}
	}

	return (
		<header className='flex justify-between shadow-sm items-center bg-white/95 sticky top-0 z-50 backdrop-blur-sm '>
			<div className='container py-2'>
				<div className='flex justify-between items-center'>
					<div className='flex items-center gap-4'>
						<Logo withSlogan isLink size='sm' />
						<LocationSelector />
					</div>

					<Navigation items={navigationItems} />
					<div className='flex items-center gap-4'>
						{isLoading ? (
							<Skeleton className='h-10 w-20' />
						) : !user || !user.isVerified ? (
							<Button
								variant='outline-primary'
								size='md'
								onClick={() => router.push('/auth/signin')}
							>
								Увійти
							</Button>
						) : (
							<>
								<button className='notification-btn'>
									<Bell className='size-5' />
									{0 > 0 && (
										<motion.span
											variants={bounceVariants}
											animate='bounce'
											className='notification-badge'
										>
											3
										</motion.span>
									)}
								</button>
								<Avatar user={user} onClick={handleAvatarClick} />
							</>
						)}

						{isLoading ? (
							<Skeleton className='h-10 w-20' />
						) : isProvider ? (
							provider?.type === ProviderType.COMPANY && (
								<AvatarCompany
									provider={provider}
									onClick={handleCompanyProfileClick}
								/>
							)
						) : (
							<Button
								variant='accent'
								size='md'
								onClick={() => router.push(ROUTES.EXECUTOR)}
								className='min-w-[160px] font-semibold'
							>
								{t('becomeProvider')}
							</Button>
						)}
					</div>
				</div>
				<Modal
					isOpen={isModalProfileOpen}
					title={t('Profile.menu')}
					onClose={closeModalProfile}
					position='top'
				>
					<div className='space-y-2'>
						<Button
							variant='outline-primary'
							size='md'
							onClick={handleProfileClick}
							className='w-full'
						>
							👤 {t('Link.profile_title')}
						</Button>

						<Button
							variant='outline-destructive'
							size='md'
							onClick={handleLogout}
							className='w-full'
						>
							🚪 {t('Link.logout')}
						</Button>
					</div>
				</Modal>
			</div>
		</header>
	)
}

export default Header

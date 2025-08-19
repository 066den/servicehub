'use client'

import Navigation from '../common/Navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'
import { bounceVariants } from '../ui/animate/variants'
import { Avatar } from '../common/Avatar'
import { useRouter } from 'next/navigation'
import Modal from '../modals/Modal'
import { Button } from '../ui/button'
import { signOut } from 'next-auth/react'
import useFlag from '@/hooks/useFlag'
import LocationSelector from '../common/LocationSelector'
import Logo from '../common/Logo'
import { ERoutes } from '@/types/enum'

//import './Header.scss'

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
	const { user } = useAuthStore()

	const [isModalProfileOpen, openModalProfile, closeModalProfile] = useFlag()

	const handleAvatarClick = () => {
		openModalProfile()
	}

	const handleProfileClick = () => {
		router.push('/profile')
		closeModalProfile()
	}

	const handleLogout = () => {
		signOut()
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
						{!user || !user.isVerified ? (
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
									🔔
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
								<Avatar onClick={handleAvatarClick} />
							</>
						)}

						<Button
							variant='accent'
							size='md'
							onClick={() => router.push(ERoutes.PROVIDER)}
							className='min-w-[160px] font-semibold'
						>
							{t('becomeProvider')}
						</Button>
					</div>
				</div>
				<Modal
					isOpen={isModalProfileOpen}
					title={t('Profile.menu')}
					onClose={closeModalProfile}
				>
					<div className='btn-column space-y-3'>
						<Button
							variant='outline'
							size='lg'
							onClick={handleProfileClick}
							withoutTransform
							className='w-full justify-start'
						>
							👤 {t('Link.profile_title')}
						</Button>

						<Button
							variant='destructive'
							size='lg'
							onClick={handleLogout}
							withoutTransform
							className='w-full justify-start'
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

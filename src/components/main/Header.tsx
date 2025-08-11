'use client'

import Link from 'next/link'
import Navigation from '../common/Navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'
import { bounceVariants } from '../ui/animate/variants'
import { Avatar } from '../common/Avatar'
import { useRouter } from 'next/navigation'
import Modal from '../modals/Modal'
import Button from '../ui/Button'
import { signOut } from 'next-auth/react'
import useFlag from '@/hooks/useFlag'
import LocationSelector from '../common/LocationSelector'
import Logo from '../common/Logo'
import { ERoutes } from '@/types/enum'

import './Header.scss'

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
		<header className='header'>
			<div className='container'>
				<div className='header-content'>
					<div className='header-left'>
						<Logo withSlogan isLink size='sm' />
						<LocationSelector />
					</div>

					<Navigation items={navigationItems} />
					<div className='header-buttons'>
						{!user || !user.isVerified ? (
							<Link href='/auth/signin' className='Button outline'>
								Увійти
							</Link>
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

						<Link href={ERoutes.PROVIDER} className='Button accent'>
							{t('becomeProvider')}
						</Link>
					</div>
				</div>
				<Modal
					isOpen={isModalProfileOpen}
					title={t('Profile.menu')}
					onClose={closeModalProfile}
				>
					<div className='btn-column'>
						<Button outline fullWidth onClick={handleProfileClick}>
							👤 {t('Link.profile_title')}
						</Button>

						<Button outline fullWidth color='danger' onClick={handleLogout}>
							🚪 {t('Link.logout')}
						</Button>
					</div>
				</Modal>
			</div>
		</header>
	)
}

export default Header

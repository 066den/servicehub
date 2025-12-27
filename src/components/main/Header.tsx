'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { bounceVariants } from '../ui/animate/variants'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import Logo from '../common/Logo'
import Avatar from '@/components/ui/Avatar'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { Skeleton } from '../ui/sceletons/skeleton'
import { Bell, LogIn, Menu } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useProvider } from '@/stores/provider/useProvider'
import AvatarCompany from '@/components/ui/AvatarCompany'
import SearchBar from '../common/SearchBar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import CatalogMenu from '../common/CatalogMenu'
import { Category } from '@/types'
import { cn } from '@/lib/utils'

interface HeaderProps {
	categories?: Category[]
}

const Header = ({ categories }: HeaderProps = {}) => {
	const t = useTranslations()

	const router = useRouter()
	// const navigationItems = useMemo(
	// 	() => [
	// 		{
	// 			label: t('Link.catalog'),
	// 			href: '/services',
	// 		},
	// 		{
	// 			label: t('Link.about'),
	// 			href: '/about',
	// 		},
	// 	],
	// 	[t]
	// )
	const { user, isLoading, logout } = useUserProfile()
	const { provider } = useProvider()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [closeTimeout, setCloseTimeout] = useState<ReturnType<
		typeof setTimeout
	> | null>(null)
	const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)

	const handleMouseEnter = () => {
		if (closeTimeout) {
			clearTimeout(closeTimeout)
			setCloseTimeout(null)
		}
		setIsDropdownOpen(true)
	}

	const handleMouseLeave = () => {
		const timeout = setTimeout(() => {
			setIsDropdownOpen(false)
		}, 150)
		setCloseTimeout(timeout)
	}

	const handleProfileClick = () => {
		router.push('/profile')
		setIsDropdownOpen(false)
	}

	const handleExecutorClick = () => {
		router.push(ROUTES.EXECUTOR)
		setIsDropdownOpen(false)
	}

	const handleLogout = async () => {
		await logout()
		setIsDropdownOpen(false)
	}

	const handleCatalogClick = () => {
		setIsCatalogMenuOpen(true)
	}

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20)
		}
		// Проверяем начальное состояние
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<header
			className={cn(
				'flex justify-between shadow-sm items-center bg-white/95 sticky top-0 z-50 backdrop-blur-sm transition-all duration-300',
				isScrolled && 'shadow-md'
			)}
		>
			<div
				className={cn(
					'container transition-all duration-300',
					isScrolled ? 'py-0.5' : 'py-2'
				)}
			>
				<div
					className={cn(
						'flex flex-col lg:flex-row justify-between items-center transition-all duration-300',
						isScrolled ? 'gap-1 lg:gap-2' : 'gap-2 lg:gap-4'
					)}
				>
					<div
						className={cn(
							'transition-all duration-300',
							isScrolled && 'scale-90 origin-left'
						)}
					>
						<Logo withSlogan={!isScrolled} isLink size='sm' />
					</div>
					<Button variant='ghost' size='icon' onClick={handleCatalogClick}>
						<Menu className='size-4' />
					</Button>
					{/* Мобильная версия поиска */}
					<div className='lg:hidden flex-1 max-w-xs transition-all duration-300'>
						<SearchBar compact={isScrolled} />
					</div>
					{/* Десктопная версия поиска */}
					<div className='hidden lg:block flex-1 max-w-3xl transition-all duration-300'>
						<SearchBar compact={isScrolled} />
					</div>

					<div
						className={cn(
							'flex items-center transition-all duration-300',
							isScrolled ? 'gap-1 lg:gap-2' : 'gap-2 lg:gap-4'
						)}
					>
						{isLoading ? (
							<>
								<Skeleton
									className={cn(
										'transition-all duration-300',
										isScrolled ? 'h-8 w-16' : 'h-10 w-20'
									)}
								/>
								<Skeleton
									className={cn(
										'transition-all duration-300',
										isScrolled ? 'h-8 w-16' : 'h-10 w-20'
									)}
								/>
							</>
						) : (
							<>
								{!user || !user.isVerified ? (
									<Button
										variant='ghost'
										size='md'
										onClick={() => router.push('/auth/signin')}
										className='transition-all duration-300'
									>
										<LogIn className='transition-all duration-300 size-4' />{' '}
										Увійти
									</Button>
								) : (
									<>
										<button
											className={cn(
												'relative transition-all duration-300',
												isScrolled && 'scale-90'
											)}
										>
											<Bell className='transition-all duration-300 size-5' />
											{0 > 0 ? (
												<motion.span
													variants={bounceVariants}
													animate='bounce'
													className='absolute top-0 right-0 -mt-4 -mr-2'
												>
													3
												</motion.span>
											) : (
												<span className='absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
											)}
										</button>
										<div
											onMouseEnter={handleMouseEnter}
											onMouseLeave={handleMouseLeave}
											className='relative'
										>
											<DropdownMenu
												open={isDropdownOpen}
												onOpenChange={setIsDropdownOpen}
												modal={false}
											>
												<DropdownMenuTrigger asChild>
													{provider ? (
														<button
															type='button'
															className={cn(
																'focus:outline-none transition-transform duration-300',
																isScrolled && 'scale-90'
															)}
															onClick={handleExecutorClick}
														>
															<AvatarCompany provider={provider} />
														</button>
													) : (
														<button
															type='button'
															className='focus:outline-none'
															onClick={handleProfileClick}
														>
															<Avatar user={user} />
														</button>
													)}
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align='end'
													className='w-56'
													onMouseEnter={handleMouseEnter}
													onMouseLeave={handleMouseLeave}
												>
													<DropdownMenuItem
														onClick={handleProfileClick}
														className='hover:bg-accent hover:text-accent-foreground cursor-pointer'
													>
														👤 {t('Link.profile_title')}
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={handleExecutorClick}
														className='hover:bg-accent hover:text-accent-foreground cursor-pointer'
													>
														👥 {t('Profile.executorTitle')}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														variant='destructive'
														onClick={handleLogout}
														className='hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive cursor-pointer'
													>
														🚪 {t('Link.logout')}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</>
								)}
								{!provider && (
									<Button
										variant='outline-accent'
										size='md'
										onClick={() => router.push(ROUTES.EXECUTOR)}
										className={cn(
											'font-semibold transition-all duration-300',
											isScrolled ? 'h-10 min-w-[140px]' : 'min-w-[160px]'
										)}
									>
										{t('becomeProvider')}
									</Button>
								)}
							</>
						)}
					</div>
				</div>
			</div>
			<CatalogMenu
				open={isCatalogMenuOpen}
				onOpenChange={setIsCatalogMenuOpen}
				initialCategories={categories}
			/>
		</header>
	)
}

export default Header

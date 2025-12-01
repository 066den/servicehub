'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { heroContentVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { useRouter } from 'next/navigation'
import SearchBar from './SearchBar'

interface HeroSectionProps {
	title?: string | null
	description?: string | null
	image?: string
	poster?: string
	videoUrl?: string
	buttonUrl?: string
}

const HeroSection = ({ title, description, image }: HeroSectionProps) => {
	const { user } = useUserProfile()
	const router = useRouter()

	return (
		<div className='relative overflow-hidden md:aspect-[3/1] aspect-[2/1]'>
			{image && (
				<div className='absolute inset-0 xl:blur-none blur-sm'>
					<Image
						src={image}
						alt={title || ''}
						fill
						sizes='100vw'
						quality={100}
						className='w-full h-full object-cover'
						priority
					/>
				</div>
			)}

			{title && (
				<motion.section
					className='absolute inset-0 flex items-center'
					variants={heroContentVariants}
				>
					<div className='max-w-3xl space-y-4 lg:space-y-6'>
						<motion.h1
							className='text-primary'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							{title}
						</motion.h1>
						{description && (
							<motion.p
								className='text-xl max-w-2xl text-foreground'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								{description}
							</motion.p>
						)}
						{/* <Statistics items={statsItems} /> */}

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className='flex items-center gap-4'
						>
							<Button variant='accent' size='lg' asChild>
								<Link href='/categories'>До каталогу</Link>
							</Button>
							{!user && (
								<Button
									variant='outline-primary'
									size='lg'
									onClick={() => router.push('/auth/signin')}
								>
									Реєстрація
								</Button>
							)}
						</motion.div>

						{/* Мобильная версия поиска */}
						<div className='lg:hidden flex-1 max-w-xs'>
							<SearchBar />
						</div>
						{/* Десктопная версия поиска */}
						<div className='hidden lg:block flex-1 max-w-2xl mx-4'>
							<SearchBar />
						</div>
					</div>
				</motion.section>
			)}
		</div>
	)
}

export default HeroSection

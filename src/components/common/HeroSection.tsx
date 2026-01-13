'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { heroContentVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { ROUTES } from '@/lib/constants'

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
		<div className='relative overflow-hidden md:aspect-[4/1] aspect-[2/1] bg-accent-gradient-light'>
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
					className='absolute inset-0 flex items-center justify-center'
					variants={heroContentVariants}
				>
					<div className='flex flex-col items-center justify-center gap-4 lg:gap-6 max-w-3xl text-center'>
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
								<Link href={ROUTES.CATELOG}>До каталогу</Link>
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
					</div>
				</motion.section>
			)}
		</div>
	)
}

export default HeroSection

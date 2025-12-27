'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '@/components/ui/animate/variants'
import ProfileHero from '@/components/profile/ProfileHero'
import { Badge } from '@/components/ui/badge'
import { formatDateToString } from '@/utils/dateFormat'
import { SkeletonProfileHero } from '@/components/ui/sceletons'
import { Skeleton } from '@/components/ui/sceletons/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MapPin, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProviderType } from '@prisma/client'
import type { LocationData } from '@/types'
import { ROUTES } from '@/lib/constants'

interface PublicProvider {
	id: number
	businessName: string
	description?: string | null
	avatar?: string | null
	rating: number
	reviewCount: number
	serviceAreas?: unknown
	location?: LocationData | null
	type: ProviderType
	createdAt: string
	services?: Array<{
		id: number
		name: string
		shortDescription?: string | null
		price?: number | null
		location?: unknown
		photos: Array<{ url: string }>
		type: {
			slug: string
		}
		subcategory: {
			name: string
			slug: string | null
			category: {
				name: string
			}
		}
	}>
	user?: {
		firstName?: string | null
		lastName?: string | null
	}
}

const PublicExecutorPage = () => {
	const params = useParams()
	const router = useRouter()
	const slugExecutor = params?.slug as string

	const [provider, setProvider] = useState<PublicProvider | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!slugExecutor) return

		const fetchProvider = async () => {
			try {
				setIsLoading(true)
				const response = await fetch(`/api/executor/${slugExecutor}`)
				const data = await response.json()

				if (!response.ok) {
					setError(data.error || 'Профіль не знайдено')
					return
				}

				setProvider(data.provider)
			} catch (err) {
				setError('Помилка завантаження профіля')
				console.error('Error fetching provider:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchProvider()
	}, [slugExecutor])

	if (isLoading) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='px-6 py-2'
			>
				<div className='space-y-4'>
					<SkeletonProfileHero />
					<Skeleton className='h-[200px] w-full rounded-lg' />
				</div>
			</motion.section>
		)
	}

	if (error || !provider) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='px-6 py-2'
			>
				<Button
					variant='outline'
					size='sm'
					onClick={() => router.back()}
					className='flex items-center gap-2 mb-6'
				>
					<ArrowLeft className='w-4 h-4' />
					Назад
				</Button>
				<div className='text-center py-12'>
					<h1 className='text-2xl font-bold mb-2'>Профіль не знайдено</h1>
					<p className='text-gray-500'>{error || 'Профіль виконавця не існує'}</p>
				</div>
			</motion.section>
		)
	}

	const displayName =
		provider.businessName ||
		[provider.user?.firstName, provider.user?.lastName]
			.filter(Boolean)
			.join(' ') ||
		'Виконавець'

	const serviceAreas = Array.isArray(provider.serviceAreas)
		? provider.serviceAreas
		: provider.serviceAreas
		? [provider.serviceAreas]
		: []

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<Button
				variant='outline'
				size='sm'
				onClick={() => router.back()}
				className='flex items-center gap-2 mb-6'
			>
				<ArrowLeft className='w-4 h-4' />
				Назад
			</Button>

			<div className='mb-6'>
				<h1 className='text-3xl font-bold mb-2'>
					{provider.type === ProviderType.COMPANY
						? 'Профіль компанії'
						: 'Профіль виконавця'}
				</h1>
			</div>

			<ProfileHero
				type='executor'
				avatar={provider.avatar || undefined}
				displayName={displayName}
				alt={provider.businessName}
				badges={
					<>
						{provider.location &&
							typeof provider.location === 'object' &&
							(provider.location as { city?: string })?.city && (
								<Badge variant='default' size='md'>
									<MapPin className='w-3 h-3 mr-1' />
									{(provider.location as { city?: string }).city}
								</Badge>
							)}
						<Badge variant='default' size='md'>
							<Star className='w-3 h-3 mr-1' />
							{provider.rating.toFixed(1)} ({provider.reviewCount} відгуків)
						</Badge>
						<Badge variant='default' size='md'>
							<Calendar className='w-3 h-3 mr-1' />
							На платформі з {formatDateToString(provider.createdAt)}
						</Badge>
					</>
				}
			/>

			{provider.description && (
				<div className='mb-6 p-4 bg-gray-50 rounded-lg'>
					<h2 className='text-xl font-semibold mb-2'>Опис</h2>
					<div
						className='prose max-w-none'
						dangerouslySetInnerHTML={{
							__html:
								typeof provider.description === 'string'
									? provider.description
									: JSON.stringify(provider.description),
						}}
					/>
				</div>
			)}

			{serviceAreas.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-3'>Регіони обслуговування</h2>
					<div className='flex flex-wrap gap-2'>
						{serviceAreas.map((area, index) => (
							<Badge key={index} variant='outline' size='md'>
								{typeof area === 'string' ? area : 'Невідомо'}
							</Badge>
						))}
					</div>
				</div>
			)}

			{provider.services && provider.services.length > 0 && (
				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-4'>Послуги</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{provider.services.map(service => {
							// Используем slug исполнителя из URL страницы
							const serviceUrl = ROUTES.SERVICE_PUBLIC(slugExecutor, service.id)

							return (
								<Link
									key={service.id}
									href={serviceUrl}
									className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block'
								>
									{service.photos.length > 0 && (
										<img
											src={service.photos[0].url}
											alt={service.name}
											className='w-full h-32 object-cover rounded mb-3'
										/>
									)}
									<h3 className='font-semibold mb-1'>{service.name}</h3>
									{service.shortDescription && (
										<p className='text-sm text-gray-600 mb-2'>
											{service.shortDescription}
										</p>
									)}
									<div className='flex items-center justify-between'>
										<Badge variant='outline' size='sm'>
											{service.subcategory.category.name} →{' '}
											{service.subcategory.name}
										</Badge>
										{service.price && (
											<span className='font-semibold text-primary'>
												{service.price} ₴
											</span>
										)}
									</div>
								</Link>
							)
						})}
					</div>
				</div>
			)}
		</motion.section>
	)
}

export default PublicExecutorPage


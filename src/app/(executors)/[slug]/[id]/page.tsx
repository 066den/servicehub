'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '@/components/ui/animate/variants'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { formatPrice } from '@/utils/textFormat'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/sceletons/skeleton'

interface Service {
	id: number
	name: string
	shortDescription?: string | null
	description?: string | null
	price?: number | null
	duration?: number | null
	pricingOptions?: unknown | null
	location?: unknown | null
	photos?: Array<{
		id: number
		url: string
		alt?: string | null
		order: number
		isMain: boolean
	}>
	addons?: Array<{
		id: number
		name: string
		description?: string | null
		price: number
		order: number
	}>
	subcategory: {
		id: number
		name: string
		slug: string | null
		category: {
			id: number
			name: string
			slug: string | null
			icon?: string | null
		}
	}
	type: {
		id: number
		name: string
		slug: string | null
	} | null
	provider: {
		id: number
		businessName: string | null
		avatar: string | null
		slug: string | null
		user: {
			firstName: string | null
			lastName: string | null
			avatar: string | null
		}
	}
}

const ServicePage = () => {
	const params = useParams()
	const router = useRouter()
	const slugExecutor = params?.slug as string
	const id = params?.id as string

	const [service, setService] = useState<Service | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!slugExecutor || !id) return

		const fetchService = async () => {
			try {
				setIsLoading(true)
				const response = await fetch(`/api/services/by-executor/${slugExecutor}/${id}`)
				const data = await response.json()

				if (!response.ok) {
					setError(data.error || 'Послугу не знайдено')
					return
				}

				setService(data.service)
			} catch (err) {
				setError('Помилка завантаження послуги')
				console.error('Error fetching service:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchService()
	}, [slugExecutor, id])

	if (isLoading) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='container mx-auto px-4 py-8'
			>
				<div className='space-y-4'>
					<Skeleton className='h-12 w-64' />
					<Skeleton className='h-96 w-full' />
					<Skeleton className='h-64 w-full' />
				</div>
			</motion.section>
		)
	}

	if (error || !service) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='container mx-auto px-4 py-8'
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
					<h1 className='text-2xl font-bold mb-2'>Послугу не знайдено</h1>
					<p className='text-gray-500'>{error || 'Послуга не існує'}</p>
				</div>
			</motion.section>
		)
	}

	const mainPhoto = service.photos?.find(photo => photo.isMain) || service.photos?.[0]
	const providerName =
		service.provider.businessName ||
		[service.provider.user.firstName, service.provider.user.lastName]
			.filter(Boolean)
			.join(' ') ||
		'Виконавець'

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='container mx-auto px-4 py-8'
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

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Фото */}
				<div>
					{mainPhoto ? (
						<div className='relative w-full aspect-square rounded-lg overflow-hidden mb-4'>
							<Image
								src={mainPhoto.url}
								alt={mainPhoto.alt || service.name}
								fill
								className='object-cover'
								sizes='(max-width: 1024px) 100vw, 50vw'
							/>
						</div>
					) : (
						<div className='w-full aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center'>
							{service.subcategory?.category?.icon && (
								<span className='text-8xl'>
									{service.subcategory.category.icon}
								</span>
							)}
						</div>
					)}

					{/* Галерея фото */}
					{service.photos && service.photos.length > 1 && (
						<div className='grid grid-cols-4 gap-2'>
							{service.photos.slice(1).map(photo => (
								<div
									key={photo.id}
									className='relative w-full aspect-square rounded-lg overflow-hidden'
								>
									<Image
										src={photo.url}
										alt={photo.alt || service.name}
										fill
										className='object-cover'
										sizes='25vw'
									/>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Информация */}
				<div>
					<h1 className='text-3xl font-bold mb-4'>{service.name}</h1>

					<div className='flex flex-wrap gap-2 mb-4'>
						<Badge variant='outline' size='md'>
							{service.subcategory.category.name} → {service.subcategory.name}
						</Badge>
						{service.type && (
							<Badge variant='outline' size='md'>
								{service.type.name}
							</Badge>
						)}
					</div>

					{service.price && (
						<div className='text-3xl font-bold text-primary mb-4'>
							{formatPrice(
								service.price,
								service.pricingOptions as Parameters<typeof formatPrice>[1]
							)}
						</div>
					)}

					{service.shortDescription && (
						<p className='text-lg text-gray-700 mb-4'>{service.shortDescription}</p>
					)}

					{service.description && (
						<div className='prose max-w-none mb-6'>
							<div
								dangerouslySetInnerHTML={{
									__html:
										typeof service.description === 'string'
											? service.description
											: JSON.stringify(service.description),
								}}
							/>
						</div>
					)}

					{/* Информация об исполнителе */}
					{service.provider.slug && (
						<Link
							href={ROUTES.EXECUTOR_PUBLIC(service.provider.slug)}
							className='block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow mb-6'
						>
							<div className='flex items-center gap-3'>
								{service.provider.avatar && (
									<div className='relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0'>
										<Image
											src={service.provider.avatar}
											alt={providerName}
											fill
											className='object-cover'
											sizes='48px'
										/>
									</div>
								)}
								<div>
									<p className='font-semibold'>{providerName}</p>
									<p className='text-sm text-gray-600'>Переглянути профіль</p>
								</div>
							</div>
						</Link>
					)}

					{/* Дополнительные услуги */}
					{service.addons && service.addons.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl font-semibold mb-3'>Додаткові послуги</h2>
							<div className='space-y-2'>
								{service.addons.map(addon => (
									<div
										key={addon.id}
										className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
									>
										<div>
											<p className='font-semibold'>{addon.name}</p>
											{addon.description && (
												<p className='text-sm text-gray-600'>{addon.description}</p>
											)}
										</div>
										<p className='font-semibold text-primary'>
											{formatPrice(addon.price)}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</motion.section>
	)
}

export default ServicePage


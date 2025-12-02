'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Plus, Edit, Trash2, EyeOff, Eye, Star } from 'lucide-react'
import ConfirmDialog from '../modals/ConfirmDialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '../ui/badge'
import { useProviderService } from '@/stores/service/useProviderService'
import { Service } from '@/types'
import Image from 'next/image'
import { PagePreloader } from '../ui/preloader'

const ServicesList = () => {
	const router = useRouter()
	const {
		services,
		isLoading,
		fetchServices,
		deleteService,
		toggleActive,
		toggleFeatured,
	} = useProviderService()
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [serviceToDelete, setServiceToDelete] = useState<{
		id: number
		name: string
	} | null>(null)

	useEffect(() => {
		fetchServices()
	}, [fetchServices])

	const handleEdit = (id: number) => {
		router.push(`/profile/services/${id}`)
	}

	const handleCreate = () => {
		router.push('/profile/services/new')
	}

	const handleDeleteClick = (service: Service) => {
		setServiceToDelete({
			id: service.id,
			name: service.name,
		})
		setDeleteConfirmOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!serviceToDelete) return

		const success = await deleteService(serviceToDelete.id)
		if (success) {
			setDeleteConfirmOpen(false)
			setServiceToDelete(null)
		}
	}

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false)
		setServiceToDelete(null)
	}

	const handleToggleActive = async (service: Service) => {
		await toggleActive(service.id)
	}

	const handleToggleFeatured = async (service: Service) => {
		await toggleFeatured(service.id)
	}

	const formatPrice = (price: number | null | undefined) => {
		if (!price) return 'Договірна'
		return `${price.toFixed(2)} ₴`
	}

	const formatDuration = (duration: number | null | undefined) => {
		if (!duration) return '—'
		const hours = Math.floor(duration / 60)
		const minutes = duration % 60
		if (hours > 0 && minutes > 0) {
			return `${hours} год. ${minutes} хв.`
		} else if (hours > 0) {
			return `${hours} год.`
		} else {
			return `${minutes} хв.`
		}
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Мої послуги</h1>
					<p className='text-secondary-foreground'>
						Управління вашими послугами
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className='size-4' /> Додати послугу
				</Button>
			</div>

			{isLoading ? (
				<PagePreloader />
			) : services.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					Послуг поки немає. Додайте першу послугу.
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow className='hover:bg-transparent'>
							<TableHead>Фото</TableHead>
							<TableHead>Назва</TableHead>
							<TableHead>Категорія</TableHead>
							<TableHead>Тип</TableHead>
							<TableHead>Ціна</TableHead>
							<TableHead>Тривалість</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{services.map(service => {
							const mainPhoto = service.photos?.find(photo => photo.isMain)
							const categoryName =
								service.subcategory?.category?.name || '—'
							const subcategoryName = service.subcategory?.name || '—'
							const typeName = service.type?.name || '—'

							return (
								<TableRow
									key={service.id}
									className='group hover:bg-gray-50/50 transition-colors'
								>
									<TableCell className='py-4'>
										{mainPhoto ? (
											<div className='relative w-16 h-16 rounded-lg overflow-hidden'>
												<Image
													src={mainPhoto.url}
													alt={mainPhoto.alt || service.name}
													fill
													className='object-cover'
												/>
											</div>
										) : (
											<div className='w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400'>
												—
											</div>
										)}
									</TableCell>
									<TableCell className='py-4'>
										<div className='font-medium text-gray-900'>
											{service.name}
										</div>
										{service.description && (
											<div className='text-sm text-gray-500 line-clamp-2 mt-1'>
												{service.description}
											</div>
										)}
									</TableCell>
									<TableCell className='py-4'>
										<div className='text-sm'>
											<div className='font-medium text-gray-900'>
												{subcategoryName}
											</div>
											<div className='text-gray-500'>{categoryName}</div>
										</div>
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{typeName}
									</TableCell>
									<TableCell className='py-4 text-gray-700 font-medium'>
										{formatPrice(service.price)}
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{formatDuration(service.duration)}
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex flex-col gap-2'>
											<Badge
												variant={service.isActive ? 'default' : 'secondary'}
											>
												{service.isActive ? 'Активна' : 'Неактивна'}
											</Badge>
											{service.isFeatured && (
												<Badge variant='outline' className='flex items-center gap-1 w-fit'>
													<Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
													Рекомендована
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => handleToggleActive(service)}
												title={service.isActive ? 'Деактивувати' : 'Активувати'}
											>
												{service.isActive ? (
													<Eye className='h-4 w-4' />
												) : (
													<EyeOff className='h-4 w-4' />
												)}
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => handleToggleFeatured(service)}
												title={
													service.isFeatured
														? 'Прибрати з рекомендованих'
														: 'Додати до рекомендованих'
												}
											>
												<Star
													className={`h-4 w-4 ${
														service.isFeatured
															? 'fill-yellow-400 text-yellow-400'
															: ''
													}`}
												/>
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => handleEdit(service.id)}
												title='Редагувати'
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive hover:text-destructive'
												title='Видалити'
												onClick={() => handleDeleteClick(service)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			)}

			<ConfirmDialog
				title='Видалити послугу'
				text={`Ви впевнені, що хочете видалити послугу "${serviceToDelete?.name}"? Цю дію неможливо скасувати.`}
				isOpen={deleteConfirmOpen}
				onClose={handleDeleteCancel}
				onDestroy={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				destroyText='Видалити'
				cancelText='Скасувати'
			/>
		</motion.section>
	)
}

export default ServicesList

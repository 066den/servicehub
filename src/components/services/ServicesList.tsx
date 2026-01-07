'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { useProviderService } from '@/stores/service/useProviderService'
import { SkeletonTable } from '../ui/sceletons'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import { ServiceRow } from './ServiceRow'

const ServicesList = () => {
	const router = useRouter()
	const { services, isLoading, fetchServices, reorderServices } =
		useProviderService()
	const [draggedServiceId, setDraggedServiceId] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

	useEffect(() => {
		fetchServices()
	}, [fetchServices])

	const { toggleActive } = useProviderService()

	const handleEdit = (id: number) => {
		router.push(`/profile/services/${id}`)
	}

	const handleCreate = () => {
		router.push('/profile/services/new')
	}

	const handleToggleActive = (id: number) => {
		toggleActive(id)
	}

	const handleDragStart = (
		_e: React.DragEvent<HTMLTableRowElement>,
		serviceId: number
	) => {
		setDraggedServiceId(serviceId)
	}

	const handleDragEnd = () => {
		setDraggedServiceId(null)
		setDragOverIndex(null)
	}

	const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	const handleDrop = async (
		e: React.DragEvent<HTMLTableRowElement>,
		targetIndex: number
	) => {
		e.preventDefault()
		setDragOverIndex(null)

		if (draggedServiceId === null) return

		const draggedIndex = services.findIndex(s => s.id === draggedServiceId)
		if (draggedIndex === -1 || draggedIndex === targetIndex) {
			setDraggedServiceId(null)
			return
		}

		// Создаем новый массив с переставленными элементами
		const newServices = [...services]
		const [draggedService] = newServices.splice(draggedIndex, 1)
		newServices.splice(targetIndex, 0, draggedService)

		// Пересчитываем порядок для всех услуг
		const reorderedServices = newServices.map((service, index) => ({
			id: service.id,
			order: index,
		}))

		// Вызываем API для обновления порядка
		await reorderServices(reorderedServices)

		setDraggedServiceId(null)
	}

	const handleDragEnter = (index: number) => {
		if (draggedServiceId !== null) {
			setDragOverIndex(index)
		}
	}

	const handleDragLeave = () => {
		setDragOverIndex(null)
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
				<Button variant='success' onClick={handleCreate}>
					<Plus className='size-4' /> Додати послугу
				</Button>
			</div>
			{isLoading ? (
				<SkeletonTable rows={6} columns={7} />
			) : services.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					Послуг поки немає. Додайте першу послугу.
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead className='w-[70px]'>Фото</TableHead>
							<TableHead>Назва</TableHead>
							<TableHead>Категорія</TableHead>
							<TableHead>Тривалість</TableHead>
							<TableHead>Ціна</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead>Рейтинг</TableHead>
							<TableHead></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{services.map((service, index) => (
							<ServiceRow
								key={service.id}
								service={service}
								onEdit={handleEdit}
								onToggleActive={handleToggleActive}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onDragOver={handleDragOver}
								onDrop={e => handleDrop(e, index)}
								onDragEnter={() => handleDragEnter(index)}
								onDragLeave={handleDragLeave}
								isDragging={draggedServiceId === service.id}
								dragOverIndex={dragOverIndex === index ? index : null}
							/>
						))}
					</TableBody>
				</Table>
			)}
		</motion.section>
	)
}

export default ServicesList

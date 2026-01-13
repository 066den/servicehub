import { TableCell, TableRow } from '../ui/table'
import { Service } from '@/types'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { Clock, Edit, Eye, EyeOff, GripVertical, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { formatDuration, formatPrice } from '@/utils/textFormat'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ServiceRowProps {
	service: Service
	onEdit: (id: number) => void
	onToggleActive: (id: number) => void
	onDragStart?: (
		e: React.DragEvent<HTMLTableRowElement>,
		serviceId: number
	) => void
	onDragEnd?: (e: React.DragEvent<HTMLTableRowElement>) => void
	onDragOver?: (e: React.DragEvent<HTMLTableRowElement>) => void
	onDrop?: (e: React.DragEvent<HTMLTableRowElement>) => void
	onDragEnter?: () => void
	onDragLeave?: () => void
	isDragging?: boolean
	dragOverIndex?: number | null
}

export const ServiceRow = ({
	service,
	onEdit,
	onToggleActive,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
	onDragEnter,
	onDragLeave,
	isDragging = false,
	dragOverIndex = null,
}: ServiceRowProps) => {
	const {
		id,
		name,
		shortDescription,
		duration,
		photos,
		type,
		isActive,
		pricingOptions,
		price,
	} = service
	const [isDraggingLocal, setIsDraggingLocal] = useState(false)
	const mainPhoto = photos?.find(photo => photo.isMain)
	const priceText = formatPrice(
		price,
		pricingOptions as Parameters<typeof formatPrice>[1]
	)

	const categoryName = service.subcategory?.category?.name || '—'
	const subcategoryName = service.subcategory?.name || '—'

	const handleEdit = () => {
		onEdit(id)
	}

	const handleToggleActive = () => {
		onToggleActive(id)
	}

	const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
		setIsDraggingLocal(true)
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', id.toString())
		onDragStart?.(e, id)
	}

	const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
		setIsDraggingLocal(false)
		onDragEnd?.(e)
	}

	return (
		<TableRow
			draggable={true}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={onDragOver}
			onDrop={onDrop}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			className={cn(
				'group hover:bg-gray-50/50 transition-colors cursor-move',
				(isDragging || isDraggingLocal) && 'opacity-50',
				dragOverIndex !== null &&
					!isDragging &&
					!isDraggingLocal &&
					'border-t-2 border-blue-500'
			)}
		>
			<TableCell>
				<GripVertical className='size-4 text-gray-400 cursor-grab active:cursor-grabbing' />
			</TableCell>
			<TableCell className='p-0'>
				<div className='relative w-full aspect-square rounded-lg overflow-hidden'>
					{mainPhoto ? (
						<Image
							src={mainPhoto.url}
							alt={mainPhoto.alt || name}
							fill
							className='object-cover'
							sizes='80px'
						/>
					) : (
						<div className='w-full h-full bg-accent-gradient-light flex items-center justify-center text-xl'>
							{type?.icon}
						</div>
					)}
				</div>
			</TableCell>
			<TableCell>
				<div className='space-y-1'>
					<div className='font-semibold text-gray-900'>{name}</div>
					{shortDescription && (
						<div className='text-sm text-secondary-foreground line-clamp-2 whitespace-normal'>
							{shortDescription}
						</div>
					)}
				</div>
			</TableCell>
			<TableCell>
				<div className='text-sm'>
					<div className='font-medium text-gray-900'>{subcategoryName}</div>
					<div className='text-gray-500'>{categoryName}</div>
				</div>
			</TableCell>
			<TableCell>
				{duration && (
					<div className='flex items-center gap-1 text-sm'>
						<Clock className='size-4' />
						{formatDuration(duration)}
					</div>
				)}
			</TableCell>
			<TableCell>
				<div className='font-semibold'>{priceText}</div>
			</TableCell>
			<TableCell>
				<Badge variant={isActive ? 'success' : 'accent'} size='sm'>
					{isActive ? 'Активна' : 'На паузі'}
				</Badge>
			</TableCell>
			<TableCell>
				<span className='text-sm text-secondary-foreground flex items-center gap-1'>
					<Star fill='currentColor' className='size-4 text-yellow-500' />
					4.9
					<span className='text-xs'>(45)</span>
				</span>
			</TableCell>
			<TableCell>
				<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
					<Button
						variant='ghost'
						size='icon'
						title='Редагувати'
						onClick={handleEdit}
					>
						<Edit className='size-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						title='Активувати'
						onClick={handleToggleActive}
					>
						{service.isActive ? (
							<EyeOff className='size-4' />
						) : (
							<Eye className='size-4' />
						)}
					</Button>
				</div>
			</TableCell>
		</TableRow>
	)
}

'use client'

import { Button } from '@/components/ui/button'
import {
	ChevronDown,
	ChevronRight,
	Plus,
	Edit,
	EyeOff,
	Trash2,
	Eye,
} from 'lucide-react'
import TypeItem from './TypeItem'
import { Subcategory, TypeService } from '@/types'
import { cn } from '@/lib/utils'

interface SubcategoryGroupProps {
	subcategory: Subcategory
	isExpanded: boolean
	onToggle: () => void
	onEdit: () => void
	onToggleActive: () => void
	onDelete?: () => void
	onAddType: () => void
	onEditType: (type: TypeService) => void
	onDeleteType?: (typeId: number) => void
}

export default function SubcategoryGroup({
	subcategory,
	isExpanded,
	onToggle,
	onEdit,
	onToggleActive,
	onDelete,
	onAddType,
	onEditType,
	onDeleteType,
}: SubcategoryGroupProps) {
	// Вычисляем популярность
	const servicesCount = subcategory.servicesCount ?? 0
	const popularity = Math.min(Math.round((servicesCount / 1000) * 100), 100)

	const getPopularityColor = (percent: number) => {
		if (percent >= 70) return 'bg-success'
		if (percent >= 40) return 'bg-primary'
		return 'bg-accent'
	}

	return (
		<div
			className={cn(
				'bg-card border-b bg-white border-gray-200 rounded-none first:rounded-t-lg last:rounded-b-lg overflow-hidden',
				subcategory.isActive ? 'opacity-100' : 'opacity-50'
			)}
		>
			{/* Заголовок подкатегории */}
			<div
				className='flex items-center justify-between p-5 transition-colors cursor-pointer'
				onClick={onToggle}
			>
				<div className='flex items-center gap-3 flex-1'>
					{isExpanded ? (
						<ChevronDown className='size-4 text-gray-500' />
					) : (
						<ChevronRight className='size-4 text-gray-500' />
					)}
					{subcategory.icon && (
						<span className='text-2xl'>{subcategory.icon}</span>
					)}
					<div className='flex-1'>
						<div className='font-semibold text-lg text-gray-900'>
							{subcategory.name}
						</div>
						<div className='text-sm text-gray-500 mt-1'>
							Категорія: {subcategory.category.name} • {servicesCount} послуг •{' '}
							{subcategory.types?.length || 0} типів послуг
						</div>
					</div>
				</div>
				<div className='flex items-center gap-4'>
					{/* Индикатор популярности */}
					<div className='flex items-center gap-2'>
						<div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
							<div
								className={`h-full rounded-full ${getPopularityColor(
									popularity
								)}`}
								style={{ width: `${popularity}%` }}
							/>
						</div>
						<span className='text-xs text-gray-500 min-w-[35px]'>
							{popularity}%
						</span>
					</div>

					<div className='flex gap-2' onClick={e => e.stopPropagation()}>
						<Button onClick={onAddType} className='text-xs'>
							<Plus className='size-4' />
							Тип послуги
						</Button>
						<Button variant='outline' onClick={onEdit} className='text-xs'>
							<Edit className='size-4' />
						</Button>
						<Button
							variant='outline'
							className='text-xs'
							onClick={onToggleActive}
							title={subcategory.isActive ? 'Приховати' : 'Показати'}
						>
							{subcategory.isActive ? (
								<Eye className='size-4' />
							) : (
								<EyeOff className='size-4' />
							)}
						</Button>
						{onDelete && (
							<Button
								variant='outline'
								className='text-xs text-red-600 hover:text-red-700'
								onClick={onDelete}
								title='Видалити підкатегорію'
							>
								<Trash2 className='size-4' />
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Список типов услуг */}
			{isExpanded && subcategory.types && subcategory.types.length > 0 && (
				<div className='bg-gray-50 border-t border-gray-200'>
					{subcategory.types.map(type => (
						<TypeItem
							key={type.id}
							type={type}
							onEdit={() => onEditType(type)}
							onDelete={onDeleteType ? () => onDeleteType(type.id) : undefined}
						/>
					))}
				</div>
			)}
		</div>
	)
}

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Plus, Edit, EyeOff } from 'lucide-react'
import TypeItem from './TypeItem'
import { Category } from '@/types'
import { Type } from '@/stores/admin/types'

interface Subcategory {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	averagePrice: number
	categoryId?: number
	types: Type[]
	category: Category
	_count: {
		types: number
	}
}

interface SubcategoryGroupProps {
	subcategory: Subcategory
	isExpanded: boolean
	onToggle: () => void
	onEdit: () => void
	onToggleActive: () => void
	onAddType: () => void
	onEditType: (type: Type) => void
	onDeleteType?: (typeId: number) => void
}

export default function SubcategoryGroup({
	subcategory,
	isExpanded,
	onToggle,
	onEdit,
	onToggleActive,
	onAddType,
	onEditType,
	onDeleteType,
}: SubcategoryGroupProps) {
	// Вычисляем популярность
	const popularity = Math.min(
		Math.round((subcategory.servicesCount / 1000) * 100),
		100
	)

	const getPopularityColor = (percent: number) => {
		if (percent >= 70) return 'bg-success'
		if (percent >= 40) return 'bg-primary'
		return 'bg-accent'
	}

	return (
		<Card className='mb-0 border-b border-gray-200 rounded-none first:rounded-t-lg last:rounded-b-lg overflow-hidden'>
			{/* Заголовок подкатегории */}
			<div
				className='flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer'
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
							Категорія: {subcategory.category.name} • {subcategory.servicesCount}{' '}
							послуг • {subcategory.types.length} типів послуг
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
					<Badge
						variant={subcategory.isActive ? 'success' : 'secondary'}
						size='sm'
					>
						{subcategory.isActive ? 'Активна' : 'Прихована'}
					</Badge>
					<div className='flex gap-2' onClick={e => e.stopPropagation()}>
						<Button
							variant='outline'
							size='sm'
							onClick={onAddType}
							className='text-xs'
						>
							<Plus className='size-3' />
							Тип послуги
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={onEdit}
							className='text-xs'
						>
							<Edit className='size-3' />
						</Button>
						<Button
							variant='outline'
							size='sm'
							className='text-xs'
							onClick={onToggleActive}
							title={subcategory.isActive ? 'Приховати' : 'Показати'}
						>
							<EyeOff className='size-3' />
						</Button>
					</div>
				</div>
			</div>

			{/* Список типов услуг */}
			{isExpanded && subcategory.types.length > 0 && (
				<div className='bg-gray-50 border-t border-gray-200'>
					{subcategory.types.map(type => (
						<TypeItem
							key={type.id}
							type={type}
							onEdit={() => onEditType(type)}
							onDelete={
								onDeleteType ? () => onDeleteType(type.id) : undefined
							}
						/>
					))}
				</div>
			)}
		</Card>
	)
}


'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Plus, Edit, EyeOff } from 'lucide-react'
import SubcategoryItem from './SubcategoryItem'

interface Subcategory {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	averagePrice: number
	_count: {
		types: number
	}
}

interface Category {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	averagePrice: number
	subcategories: Subcategory[]
	_count: {
		services: number
		subcategories: number
	}
}

interface CategoryGroupProps {
	category: Category
	isExpanded: boolean
	onToggle: () => void
	onEdit: () => void
	onToggleActive: () => void
	onAddSubcategory: () => void
	onEditSubcategory: (subcategory: Subcategory) => void
	onToggleSubcategoryActive?: (subcategory: Subcategory) => void
	onDeleteSubcategory?: (subcategory: Subcategory) => void
}

export default function CategoryGroup({
	category,
	isExpanded,
	onToggle,
	onEdit,
	onToggleActive,
	onAddSubcategory,
	onEditSubcategory,
	onToggleSubcategoryActive,
	onDeleteSubcategory,
}: CategoryGroupProps) {
	// Вычисляем популярность (процент от максимального количества услуг)
	// Для примера используем просто процент от 1000
	const popularity = Math.min(
		Math.round((category.servicesCount / 1000) * 100),
		100
	)

	const getPopularityColor = (percent: number) => {
		if (percent >= 70) return 'bg-success'
		if (percent >= 40) return 'bg-primary'
		return 'bg-accent'
	}

	return (
		<Card className='mb-0 border-b border-gray-200 rounded-none first:rounded-t-lg last:rounded-b-lg overflow-hidden'>
			{/* Заголовок категории */}
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
					{category.icon && (
						<span className='text-2xl'>{category.icon}</span>
					)}
					<div className='flex-1'>
						<div className='font-semibold text-lg text-gray-900'>
							{category.name}
						</div>
						<div className='text-sm text-gray-500 mt-1'>
							{category.servicesCount} послуг • {category.subcategories.length}{' '}
							типів робіт
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
						variant={category.isActive ? 'success' : 'secondary'}
						size='sm'
					>
						{category.isActive ? 'Активна' : 'Прихована'}
					</Badge>
					<div className='flex gap-2' onClick={(e) => e.stopPropagation()}>
						<Button
							variant='outline'
							size='sm'
							onClick={onAddSubcategory}
							className='text-xs'
						>
							<Plus className='size-3' />
							Тип роботи
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
							onClick={(e) => {
								e.stopPropagation()
								onToggleActive()
							}}
							title={category.isActive ? 'Приховати' : 'Показати'}
						>
							<EyeOff className='size-3' />
						</Button>
					</div>
				</div>
			</div>

			{/* Список подкатегорий */}
			{isExpanded && category.subcategories.length > 0 && (
				<div className='bg-gray-50 border-t border-gray-200'>
					{category.subcategories.map((subcategory) => (
						<SubcategoryItem
							key={subcategory.id}
							subcategory={subcategory}
							onEdit={() => onEditSubcategory(subcategory)}
							onToggleActive={
								onToggleSubcategoryActive
									? () => onToggleSubcategoryActive(subcategory)
									: undefined
							}
							onDelete={
								onDeleteSubcategory
									? () => onDeleteSubcategory(subcategory)
									: undefined
							}
						/>
					))}
				</div>
			)}
		</Card>
	)
}


'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, EyeOff, Trash2 } from 'lucide-react'
import { Subcategory } from '@/types'

interface SubcategoryItemProps {
	subcategory: Subcategory
	onEdit: () => void
	onToggleActive?: () => void
	onDelete?: () => void
}

export default function SubcategoryItem({
	subcategory,
	onEdit,
	onToggleActive,
	onDelete,
}: SubcategoryItemProps) {
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'UAH',
			minimumFractionDigits: 0,
		}).format(price)
	}

	return (
		<div className='flex items-center justify-between p-5 pl-16 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors'>
			<div className='flex items-center gap-4 flex-1'>
				{subcategory.icon && (
					<div className='size-10 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl'>
						{subcategory.icon}
					</div>
				)}
				<div className='flex-1'>
					<div className='font-semibold text-gray-900 mb-1'>
						{subcategory.name}
					</div>
					{subcategory.description && (
						<div className='text-sm text-gray-600 mb-2'>
							{subcategory.description}
						</div>
					)}
					<div className='text-xs text-gray-500'>
						{subcategory.servicesCount} послуг • Середня ціна:{' '}
						{formatPrice(subcategory.averagePrice)}
					</div>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<Badge
					variant={subcategory.isActive ? 'success' : 'secondary'}
					size='sm'
				>
					{subcategory.isActive ? 'Активний' : 'Прихований'}
				</Badge>
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
				<Button
					variant='outline'
					size='sm'
					className='text-xs text-destructive hover:text-destructive hover:bg-destructive/10'
					onClick={onDelete}
				>
					<Trash2 className='size-3' />
				</Button>
			</div>
		</div>
	)
}


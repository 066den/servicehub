'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, EyeOff, Trash2 } from 'lucide-react'
import { Type } from '@/stores/admin/types'

interface TypeItemProps {
	type: Type
	onEdit: () => void
	onDelete?: () => void
}

export default function TypeItem({ type, onEdit, onDelete }: TypeItemProps) {
	return (
		<div className='flex items-center justify-between p-5 pl-16 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors'>
			<div className='flex items-center gap-4 flex-1'>
				{type.icon && (
					<div className='size-10 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl'>
						{type.icon}
					</div>
				)}
				<div className='flex-1'>
					<div className='font-semibold text-gray-900 mb-1'>{type.name}</div>
					{type.description && (
						<div className='text-sm text-gray-600 mb-2'>
							{type.description}
						</div>
					)}
					<div className='text-xs text-gray-500'>
						{type.servicesCount} послуг
					</div>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<Badge variant={type.isActive ? 'success' : 'secondary'} size='sm'>
					{type.isActive ? 'Активний' : 'Прихований'}
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
					onClick={() => {
						// TODO: Реализовать скрытие типа
					}}
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


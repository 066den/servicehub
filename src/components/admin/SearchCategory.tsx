import { SelectContent } from '../ui/select'

import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectTrigger, SelectValue, SelectItem } from '../ui/select'
import { Category } from '@/types'

interface SearchCategoryProps {
	searchQuery: string
	handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
	statusFilter: string
	setStatusFilter: (value: string) => void
	categoryFilter?: string
	setCategoryFilter?: (value: string) => void
	categories?: Category[]
}

export function SearchCategory({
	searchQuery,
	handleSearch,
	statusFilter,
	setStatusFilter,
	categoryFilter,
	setCategoryFilter,
	categories = [],
}: SearchCategoryProps) {
	return (
		<Card className='p-4'>
			<div className='flex flex-wrap gap-4'>
				<div className='flex-1 min-w-[200px]'>
					<Input
						placeholder='Пошук категорій...'
						value={searchQuery}
						onChange={handleSearch}
						className='mb-0'
					/>
				</div>
				{setCategoryFilter && (
					<div className='flex-1 max-w-[200px]'>
						<Select
							value={categoryFilter || 'all'}
							onValueChange={setCategoryFilter}
						>
							<SelectTrigger className='h-13'>
								<SelectValue placeholder='Всі категорії' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Всі категорії</SelectItem>
								{categories.map(category => (
									<SelectItem key={category.id} value={String(category.id)}>
										{category.icon && <span className='mr-2'>{category.icon}</span>}
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className='flex-1 max-w-[200px]'>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className='h-13'>
							<SelectValue placeholder='Всі статуси' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Всі статуси</SelectItem>
							<SelectItem value='active'>Активні</SelectItem>
							<SelectItem value='hidden'>Приховані</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</Card>
	)
}

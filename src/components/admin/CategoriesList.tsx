'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Edit, EyeOff, Eye, Trash2 } from 'lucide-react'
import AddCategoryModal from './AddCategoryModal'
import { Category } from '@/types'
import { useService } from '@/stores/service/useService'
import Image from 'next/image'
import { PagePreloader } from '../ui/preloader'

import { cn } from '@/lib/utils'
import useFlag from '@/hooks/useFlag'
import { SearchCategory } from './SearchCategory'
import ConfirmDialog from '../modals/ConfirmDialog'

export default function CategoriesList() {
	const {
		categories,
		isLoading,
		fetchCategories,
		toggleCategoryStatus,
		deleteCategory,
	} = useService()

	const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [
		isEditCategoryModalOpen,
		editCategoryModalOpen,
		editCategoryModalClose,
	] = useFlag()
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
		null
	)

	const filterCategories = useCallback(() => {
		let filtered = [...categories]

		// Поиск
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				category =>
					category.name.toLowerCase().includes(query) ||
					category.description?.toLowerCase().includes(query)
			)
		}

		// Фильтр по статусу
		if (statusFilter === 'active') {
			filtered = filtered.filter(cat => cat.isActive)
		} else if (statusFilter === 'hidden') {
			filtered = filtered.filter(cat => !cat.isActive)
		}
		// Если statusFilter === 'all', не фильтруем

		setFilteredCategories(filtered)
	}, [categories, searchQuery, statusFilter])

	useEffect(() => {
		fetchCategories()
	}, [fetchCategories])

	useEffect(() => {
		filterCategories()
	}, [filterCategories])

	const handleAddCategory = () => {
		setEditingCategory(null)
		editCategoryModalOpen()
	}

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category)
		editCategoryModalOpen()
	}

	const handleCategorySaved = () => {
		editCategoryModalClose()
		setEditingCategory(null)
	}

	const handleToggleCategory = async (categoryId: number) => {
		await toggleCategoryStatus(categoryId)
	}

	const handleDeleteClick = (category: Category) => {
		setCategoryToDelete(category)
		setDeleteConfirmOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!categoryToDelete) return
		await deleteCategory(categoryToDelete.id)
		setDeleteConfirmOpen(false)
		setCategoryToDelete(null)
	}

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false)
		setCategoryToDelete(null)
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	return (
		<>
			<SearchCategory
				searchQuery={searchQuery}
				handleSearch={handleSearch}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
			/>
			{/* Действия */}
			<Card className='p-4'>
				<div className='flex items-center justify-between'>
					<h4>Категорії ({filteredCategories.length})</h4>
					<Button onClick={handleAddCategory}>
						<Plus className='size-4' />
						Додати категорію
					</Button>
				</div>
			</Card>
			{/* Список категорий */}
			<div className='space-y-0'>
				{isLoading ? (
					<PagePreloader text='Завантаження категорій...' />
				) : filteredCategories.length === 0 ? (
					<Card className='p-12 text-center'>
						<div className='text-gray-500'>
							Категорії не знайдено. Додайте першу категорію.
						</div>
					</Card>
				) : (
					filteredCategories.map(category => (
						<div
							key={category.id}
							className={cn(
								'bg-card border-b bg-white border-gray-200 rounded-none first:rounded-t-lg last:rounded-b-lg overflow-hidden',
								!category.isActive && 'opacity-100'
							)}
						>
							<div className='flex items-center justify-between p-5 hover:bg-gray-50 transition-colors'>
								<div className='flex items-center gap-3 flex-1'>
									{category.image ? (
										<div className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative'>
											<Image
												src={category.image}
												alt={category.name}
												fill
												sizes='100px'
												className='object-cover'
											/>
										</div>
									) : category.icon ? (
										<span className='text-2xl'>{category.icon}</span>
									) : null}
									<div className='flex-1'>
										<div className='font-semibold text-lg text-gray-900'>
											{category.name}
										</div>
										{category.description && (
											<div className='text-sm text-gray-500 mt-1'>
												{category.description}
											</div>
										)}
										<div className='text-sm text-gray-500 mt-1'>
											{category.servicesCount || 0} послуг •{' '}
											{category._count?.subcategories || 0} підкатегорій
										</div>
									</div>
								</div>
								<div className='flex items-center gap-4'>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											onClick={() => handleEditCategory(category)}
											className='text-xs'
										>
											<Edit className='size-5' />
										</Button>
										<Button
											variant='outline'
											className='text-xs'
											onClick={() => handleToggleCategory(category.id)}
											title={category.isActive ? 'Приховати' : 'Показати'}
										>
											{category.isActive ? (
												<Eye className='size-5' />
											) : (
												<EyeOff className='size-5' />
											)}
										</Button>
										<Button
											variant='outline'
											className='text-xs text-red-600 hover:text-red-700'
											onClick={() => handleDeleteClick(category)}
											title='Видалити категорію'
										>
											<Trash2 className='size-5' />
										</Button>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
			{/* Модал */}
			<AddCategoryModal
				isOpen={isEditCategoryModalOpen}
				onClose={() => {
					editCategoryModalClose()
					setEditingCategory(null)
				}}
				onSave={handleCategorySaved}
				category={editingCategory}
			/>

			<ConfirmDialog
				title='Видалити категорію'
				text={`Ви впевнені, що хочете видалити категорію "${
					categoryToDelete?.name || ''
				}"? Цю дію неможливо скасувати.`}
				isOpen={deleteConfirmOpen}
				onClose={handleDeleteCancel}
				onDestroy={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				destroyText='Видалити'
				cancelText='Скасувати'
			/>
		</>
	)
}

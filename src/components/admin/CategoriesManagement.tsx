'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import CategoryGroup from './CategoryGroup'
import AddCategoryModal from './AddCategoryModal'
import AddSubcategoryModal from './AddSubcategoryModal'
import { Category, Subcategory } from '@/types'

export default function CategoriesManagement() {
	const [categories, setCategories] = useState<Category[]>([])
	const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [levelFilter, setLevelFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
		new Set()
	)
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
	const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)
	const [editingSubcategory, setEditingSubcategory] = useState<{
		categoryId: number
		subcategory: Subcategory | null
	} | null>(null)
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
		null
	)
	const [loading, setLoading] = useState(true)

	const fetchCategories = async () => {
		try {
			setLoading(true)
			const response = await fetch('/api/services/categories')
			const data = await response.json()

			if (data.success) {
				setCategories(data.categories)
				// По умолчанию разворачиваем все категории
				setExpandedCategories(
					new Set(data.categories.map((cat: Category) => cat.id))
				)
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		} finally {
			setLoading(false)
		}
	}

	const filterCategories = useCallback(() => {
		let filtered = [...categories]

		// Поиск
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(category => {
				const matchesCategory =
					category.name.toLowerCase().includes(query) ||
					category.description?.toLowerCase().includes(query)

				const matchesSubcategory = category.subcategories.some(
					sub =>
						sub.name.toLowerCase().includes(query) ||
						sub.description?.toLowerCase().includes(query)
				)

				return matchesCategory || matchesSubcategory
			})
		}

		// Фильтр по уровню
		if (levelFilter === 'category') {
			// Показываем только категории (без подкатегорий)
			filtered = filtered.map(cat => ({
				...cat,
				subcategories: [],
			}))
		} else if (levelFilter === 'subcategory') {
			// Показываем только категории с подкатегориями
			filtered = filtered.filter(cat => cat.subcategories.length > 0)
		}

		// Фильтр по статусу
		if (statusFilter === 'active') {
			// Показываем только активные
			filtered = filtered
				.filter(cat => cat.isActive)
				.map(cat => ({
					...cat,
					subcategories: cat.subcategories.filter(sub => sub.isActive),
				}))
		} else if (statusFilter === 'hidden') {
			// Показываем только скрытые
			filtered = filtered
				.filter(cat => !cat.isActive)
				.map(cat => ({
					...cat,
					subcategories: cat.subcategories.filter(sub => !sub.isActive),
				}))
		}

		setFilteredCategories(filtered)
	}, [categories, searchQuery, levelFilter, statusFilter])

	useEffect(() => {
		fetchCategories()
	}, [])

	useEffect(() => {
		filterCategories()
	}, [filterCategories])

	const toggleCategory = (categoryId: number) => {
		setExpandedCategories(prev => {
			const newSet = new Set(prev)
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId)
			} else {
				newSet.add(categoryId)
			}
			return newSet
		})
	}

	const expandAllCategories = () => {
		setExpandedCategories(new Set(categories.map(cat => cat.id)))
	}

	const collapseAllCategories = () => {
		setExpandedCategories(new Set())
	}

	const handleAddCategory = () => {
		setEditingCategory(null)
		setIsCategoryModalOpen(true)
	}

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category)
		setIsCategoryModalOpen(true)
	}

	const handleAddSubcategory = (categoryId: number) => {
		setSelectedCategoryId(categoryId)
		setEditingSubcategory({ categoryId, subcategory: null })
		setIsSubcategoryModalOpen(true)
	}

	const handleEditSubcategory = (
		categoryId: number,
		subcategory: Subcategory
	) => {
		setSelectedCategoryId(categoryId)
		setEditingSubcategory({ categoryId, subcategory })
		setIsSubcategoryModalOpen(true)
	}

	const handleCategorySaved = () => {
		setIsCategoryModalOpen(false)
		setEditingCategory(null)
		fetchCategories()
	}

	const handleSubcategorySaved = () => {
		setIsSubcategoryModalOpen(false)
		setEditingSubcategory(null)
		setSelectedCategoryId(null)
		fetchCategories()
	}

	const handleToggleCategory = async (categoryId: number) => {
		try {
			const response = await fetch(
				`/api/services/categories/${categoryId}/toggle`,
				{
					method: 'PATCH',
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка зміни статусу')
			}

			fetchCategories()
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Помилка зміни статусу категорії'
			)
		}
	}

	const handleToggleSubcategory = async (subcategory: Subcategory) => {
		try {
			const response = await fetch(
				`/api/services/subcategories/${subcategory.id}/toggle`,
				{
					method: 'PATCH',
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка зміни статусу')
			}

			fetchCategories()
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Помилка зміни статусу типу роботи'
			)
		}
	}

	const handleDeleteSubcategory = async (subcategory: Subcategory) => {
		if (
			!confirm(
				`Ви впевнені, що хочете видалити "${subcategory.name}"? Цю дію неможливо скасувати.`
			)
		) {
			return
		}

		try {
			const response = await fetch(
				`/api/services/subcategories/${subcategory.id}`,
				{
					method: 'DELETE',
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка видалення')
			}

			fetchCategories()
		} catch (error) {
			alert(
				error instanceof Error ? error.message : 'Помилка видалення типу роботи'
			)
		}
	}

	if (loading) {
		return (
			<div className='p-6'>
				<div className='text-center py-12'>Завантаження...</div>
			</div>
		)
	}

	return (
		<div className='p-6 space-y-6'>
			{/* Заголовок и действия */}
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold text-gray-900'>
					Категорії та типи робіт
				</h1>
			</div>

			{/* Поиск и фильтры */}
			<Card className='p-4'>
				<div className='flex flex-wrap gap-4'>
					<div className='flex-1 min-w-[200px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5' />
							<Input
								placeholder='Пошук категорій та типів робіт...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>
					<select
						className='h-11 px-4 rounded-lg border-2 border-gray-200 bg-input text-base font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
						value={levelFilter}
						onChange={e => setLevelFilter(e.target.value)}
					>
						<option value=''>Всі рівні</option>
						<option value='category'>Тільки категорії</option>
						<option value='subcategory'>Тільки типи робіт</option>
					</select>
					<select
						className='h-11 px-4 rounded-lg border-2 border-gray-200 bg-input text-base font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
						value={statusFilter}
						onChange={e => setStatusFilter(e.target.value)}
					>
						<option value=''>Всі статуси</option>
						<option value='active'>Активні</option>
						<option value='hidden'>Приховані</option>
					</select>
				</div>
			</Card>

			{/* Действия */}
			<Card className='p-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold text-gray-900'>
						Категорії та типи робіт
					</h3>
					<div className='flex gap-2'>
						<Button variant='outline' size='sm' onClick={expandAllCategories}>
							📂 Розгорнути всі
						</Button>
						<Button variant='outline' size='sm' onClick={collapseAllCategories}>
							📁 Згорнути всі
						</Button>
						<Button onClick={handleAddCategory}>
							<Plus className='size-4' />
							Додати категорію
						</Button>
					</div>
				</div>
			</Card>

			{/* Список категорий */}
			<div className='space-y-0'>
				{filteredCategories.length === 0 ? (
					<Card className='p-12 text-center'>
						<div className='text-gray-500'>
							Категорії не знайдено. Додайте першу категорію.
						</div>
					</Card>
				) : (
					filteredCategories.map(category => (
						<CategoryGroup
							key={category.id}
							category={category}
							isExpanded={expandedCategories.has(category.id)}
							onToggle={() => toggleCategory(category.id)}
							onEdit={() => handleEditCategory(category)}
							onToggleActive={() => handleToggleCategory(category.id)}
							onAddSubcategory={() => handleAddSubcategory(category.id)}
							onEditSubcategory={subcategory =>
								handleEditSubcategory(category.id, subcategory)
							}
							onToggleSubcategoryActive={handleToggleSubcategory}
							onDeleteSubcategory={handleDeleteSubcategory}
						/>
					))
				)}
			</div>

			{/* Модалы */}
			<AddCategoryModal
				isOpen={isCategoryModalOpen}
				onClose={() => {
					setIsCategoryModalOpen(false)
					setEditingCategory(null)
				}}
				onSave={handleCategorySaved}
				category={editingCategory}
			/>

			<AddSubcategoryModal
				isOpen={isSubcategoryModalOpen}
				onClose={() => {
					setIsSubcategoryModalOpen(false)
					setEditingSubcategory(null)
					setSelectedCategoryId(null)
				}}
				onSave={handleSubcategorySaved}
				categoryId={selectedCategoryId}
				subcategory={editingSubcategory?.subcategory || null}
			/>
		</div>
	)
}


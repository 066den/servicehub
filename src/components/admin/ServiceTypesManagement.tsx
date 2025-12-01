'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import SubcategoryGroup from './SubcategoryGroup'
import AddSubcategoryModal from './AddSubcategoryModal'
import AddTypeModal from './AddTypeModal'
import { Type } from '@/stores/admin/types'
import { useService } from '@/stores/service/useService'
import { SubcategoryWithTypes } from '@/stores/admin/types'

export default function ServiceTypesManagement() {
	const { subcategories, fetchSubcategories } = useService()
	const [filteredSubcategories, setFilteredSubcategories] = useState<
		SubcategoryWithTypes[]
	>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [expandedSubcategories, setExpandedSubcategories] = useState<
		Set<number>
	>(new Set())
	const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false)
	const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
	const [editingSubcategory, setEditingSubcategory] =
		useState<SubcategoryWithTypes | null>(null)
	const [editingType, setEditingType] = useState<{
		subcategoryId: number
		type: {
			id: number
			name: string
			slug: string | null
			icon: string | null
			description: string | null
			isActive: boolean
		} | null
	} | null>(null)
	const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
		number | null
	>(null)

	const filterSubcategories = useCallback(() => {
		let filtered = [...subcategories]

		// Поиск
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(subcategory => {
				const matchesSubcategory =
					subcategory.name.toLowerCase().includes(query) ||
					subcategory.description?.toLowerCase().includes(query)

				const matchesType = subcategory.types.some(
					type =>
						type.name.toLowerCase().includes(query) ||
						type.description?.toLowerCase().includes(query)
				)

				return matchesSubcategory || matchesType
			})
		}

		// Фильтр по статусу
		if (statusFilter === 'active') {
			filtered = filtered
				.filter(sub => sub.isActive)
				.map(sub => ({
					...sub,
					types: sub.types.filter(type => type.isActive),
				}))
		} else if (statusFilter === 'hidden') {
			filtered = filtered
				.filter(sub => !sub.isActive)
				.map(sub => ({
					...sub,
					types: sub.types.filter(type => !type.isActive),
				}))
		}

		setFilteredSubcategories(filtered)
	}, [subcategories, searchQuery, statusFilter])

	useEffect(() => {
		fetchSubcategories()
	}, [fetchSubcategories])

	useEffect(() => {
		if (subcategories.length > 0) {
			// По умолчанию разворачиваем все подкатегории
			setExpandedSubcategories(new Set(subcategories.map(sub => sub.id)))
		}
	}, [subcategories])

	useEffect(() => {
		filterSubcategories()
	}, [filterSubcategories])

	const toggleSubcategory = (subcategoryId: number) => {
		setExpandedSubcategories(prev => {
			const newSet = new Set(prev)
			if (newSet.has(subcategoryId)) {
				newSet.delete(subcategoryId)
			} else {
				newSet.add(subcategoryId)
			}
			return newSet
		})
	}

	const expandAllSubcategories = () => {
		setExpandedSubcategories(new Set(subcategories.map(sub => sub.id)))
	}

	const collapseAllSubcategories = () => {
		setExpandedSubcategories(new Set())
	}

	const handleAddSubcategory = () => {
		setEditingSubcategory(null)
		setIsSubcategoryModalOpen(true)
	}

	const handleEditSubcategory = (subcategory: SubcategoryWithTypes) => {
		setEditingSubcategory(subcategory)
		setIsSubcategoryModalOpen(true)
	}

	const handleAddType = (subcategoryId: number) => {
		setSelectedSubcategoryId(subcategoryId)
		setEditingType({ subcategoryId, type: null })
		setIsTypeModalOpen(true)
	}

	const handleEditType = (subcategoryId: number, type: Type) => {
		setSelectedSubcategoryId(subcategoryId)
		setEditingType({ subcategoryId, type })
		setIsTypeModalOpen(true)
	}

	const handleSubcategorySaved = () => {
		setIsSubcategoryModalOpen(false)
		setEditingSubcategory(null)
		fetchSubcategories()
	}

	const handleTypeSaved = () => {
		setIsTypeModalOpen(false)
		setEditingType(null)
		setSelectedSubcategoryId(null)
		fetchSubcategories()
	}

	const handleToggleSubcategory = async (subcategoryId: number) => {
		try {
			const response = await fetch(
				`/api/services/subcategories/${subcategoryId}/toggle`,
				{
					method: 'PATCH',
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка зміни статусу')
			}

			fetchSubcategories()
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Помилка зміни статусу підкатегорії'
			)
		}
	}

	const handleDeleteType = async (typeId: number) => {
		if (
			!confirm(
				'Ви впевнені, що хочете видалити цей тип послуги? Цю дію неможливо скасувати.'
			)
		) {
			return
		}

		try {
			const response = await fetch(`/api/services/types/${typeId}`, {
				method: 'DELETE',
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка видалення')
			}

			fetchSubcategories()
		} catch (error) {
			alert(
				error instanceof Error
					? error.message
					: 'Помилка видалення типу послуги'
			)
		}
	}

	return (
		<>
			{/* Поиск и фильтры */}
			<Card className='p-4'>
				<div className='flex flex-wrap gap-4'>
					<div className='flex-1 min-w-[200px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5' />
							<Input
								placeholder='Пошук типів послуг...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>
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
					<h3 className='text-lg font-semibold text-gray-900'>Типи послуг</h3>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={expandAllSubcategories}
						>
							📂 Розгорнути всі
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={collapseAllSubcategories}
						>
							📁 Згорнути всі
						</Button>
						<Button onClick={handleAddSubcategory}>
							<Plus className='size-4' />
							Додати підкатегорію
						</Button>
					</div>
				</div>
			</Card>

			{/* Список подкатегорий с типами */}
			<div className='space-y-0'>
				{filteredSubcategories.length === 0 ? (
					<Card className='p-12 text-center'>
						<div className='text-gray-500'>
							Підкатегорії не знайдено. Додайте першу підкатегорію.
						</div>
					</Card>
				) : (
					filteredSubcategories.map(subcategory => (
						<SubcategoryGroup
							key={subcategory.id}
							subcategory={subcategory}
							isExpanded={expandedSubcategories.has(subcategory.id)}
							onToggle={() => toggleSubcategory(subcategory.id)}
							onEdit={() => handleEditSubcategory(subcategory)}
							onToggleActive={() => handleToggleSubcategory(subcategory.id)}
							onAddType={() => handleAddType(subcategory.id)}
							onEditType={type => handleEditType(subcategory.id, type)}
							onDeleteType={handleDeleteType}
						/>
					))
				)}
			</div>

			{/* Модалы */}
			<AddSubcategoryModal
				isOpen={isSubcategoryModalOpen}
				onClose={() => {
					setIsSubcategoryModalOpen(false)
					setEditingSubcategory(null)
				}}
				onSave={handleSubcategorySaved}
				categoryId={editingSubcategory?.category?.id || null}
				subcategory={editingSubcategory}
			/>

			<AddTypeModal
				isOpen={isTypeModalOpen}
				onClose={() => {
					setIsTypeModalOpen(false)
					setEditingType(null)
					setSelectedSubcategoryId(null)
				}}
				onSave={handleTypeSaved}
				subcategoryId={selectedSubcategoryId}
				type={editingType?.type || null}
			/>
		</>
	)
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import SubcategoryGroup from './SubcategoryGroup'
import AddSubcategoryModal from './AddSubcategoryModal'
import AddTypeModal from './AddTypeModal'
import { useService } from '@/stores/service/useService'
import { SubcategoryWithTypes } from '@/stores/admin/types'
import { SearchCategory } from './SearchCategory'
import { PagePreloader } from '../ui/preloader'
import { TypeService } from '@/types'
import ConfirmDialog from '../modals/ConfirmDialog'
import useFlag from '@/hooks/useFlag'

export default function ServiceTypesManagement() {
	const {
		subcategories,
		fetchSubcategories,
		isLoading,
		deleteType,
		deleteSubcategory,
		toggleSubcategoryStatus,
	} = useService()
	const [filteredSubcategories, setFilteredSubcategories] = useState<
		SubcategoryWithTypes[]
	>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [expandedSubcategories, setExpandedSubcategories] = useState<
		Set<number>
	>(new Set())
	const [isSubcategoryModalOpen, subcategoryModalOpen, subcategoryModalClose] =
		useFlag()
	const [isTypeModalOpen, typeModalOpen, typeModalClose] = useFlag()
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
	const [deleteSubcategoryConfirmOpen, setDeleteSubcategoryConfirmOpen] =
		useState(false)
	const [subcategoryToDelete, setSubcategoryToDelete] =
		useState<SubcategoryWithTypes | null>(null)
	const [deleteTypeConfirmOpen, setDeleteTypeConfirmOpen] = useState(false)
	const [typeToDelete, setTypeToDelete] = useState<number | null>(null)

	const filterSubcategories = useCallback(() => {
		let filtered = [...subcategories]

		// Поиск
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(subcategory => {
				const matchesSubcategory =
					subcategory.name.toLowerCase().includes(query) ||
					subcategory.description?.toLowerCase().includes(query)

				const matchesType =
					subcategory.types?.some(
						type =>
							type.name.toLowerCase().includes(query) ||
							type.description?.toLowerCase().includes(query)
					) || false

				return matchesSubcategory || matchesType
			})
		}

		// Фильтр по статусу
		if (statusFilter === 'active') {
			filtered = filtered
				.filter(sub => sub.isActive)
				.map(sub => ({
					...sub,
					types: sub.types?.filter(type => type.isActive) || [],
				}))
		} else if (statusFilter === 'hidden') {
			filtered = filtered
				.filter(sub => !sub.isActive)
				.map(sub => ({
					...sub,
					types: sub.types?.filter(type => !type.isActive) || [],
				}))
		}

		setFilteredSubcategories(filtered)
	}, [subcategories, searchQuery, statusFilter])

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

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
		subcategoryModalOpen()
	}

	const handleEditSubcategory = (subcategory: SubcategoryWithTypes) => {
		setEditingSubcategory(subcategory)
		subcategoryModalOpen()
	}

	const handleAddType = (subcategoryId: number) => {
		setSelectedSubcategoryId(subcategoryId)
		setEditingType({ subcategoryId, type: null })
		typeModalOpen()
	}

	const handleEditType = (subcategoryId: number, type: TypeService) => {
		setSelectedSubcategoryId(subcategoryId)
		setEditingType({ subcategoryId, type })
		typeModalOpen()
	}

	const handleSubcategorySaved = () => {
		subcategoryModalClose()
		setEditingSubcategory(null)
		fetchSubcategories()
	}

	const handleTypeSaved = () => {
		typeModalClose()
		setEditingType(null)
		setSelectedSubcategoryId(null)
		fetchSubcategories()
	}

	const handleToggleSubcategory = async (subcategoryId: number) => {
		await toggleSubcategoryStatus(subcategoryId)
	}

	const handleDeleteSubcategory = (subcategoryId: number) => {
		const subcategory = subcategories.find(sub => sub.id === subcategoryId)
		if (subcategory) {
			setSubcategoryToDelete(subcategory)
			setDeleteSubcategoryConfirmOpen(true)
		}
	}

	const handleDeleteSubcategoryConfirm = async () => {
		if (!subcategoryToDelete) return
		await deleteSubcategory(subcategoryToDelete.id)
		setDeleteSubcategoryConfirmOpen(false)
		setSubcategoryToDelete(null)
	}

	const handleDeleteSubcategoryCancel = () => {
		setDeleteSubcategoryConfirmOpen(false)
		setSubcategoryToDelete(null)
	}

	const handleDeleteType = (typeId: number) => {
		setTypeToDelete(typeId)
		setDeleteTypeConfirmOpen(true)
	}

	const handleDeleteTypeConfirm = async () => {
		if (!typeToDelete) return
		await deleteType(typeToDelete)
		setDeleteTypeConfirmOpen(false)
		setTypeToDelete(null)
	}

	const handleDeleteTypeCancel = () => {
		setDeleteTypeConfirmOpen(false)
		setTypeToDelete(null)
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
					<h4>Типи послуг</h4>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={expandAllSubcategories}>
							📂 Розгорнути всі
						</Button>
						<Button variant='outline' onClick={collapseAllSubcategories}>
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
				{isLoading ? (
					<PagePreloader text='Завантаження підкатегорій...' />
				) : filteredSubcategories.length === 0 ? (
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
							onDelete={() => handleDeleteSubcategory(subcategory.id)}
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
					subcategoryModalClose()
					setEditingSubcategory(null)
				}}
				onSave={handleSubcategorySaved}
				categoryId={editingSubcategory?.category?.id || null}
				subcategory={editingSubcategory}
			/>

			<AddTypeModal
				isOpen={isTypeModalOpen}
				onClose={() => {
					typeModalClose()
					setEditingType(null)
					setSelectedSubcategoryId(null)
				}}
				onSave={handleTypeSaved}
				subcategoryId={selectedSubcategoryId}
				type={editingType?.type || null}
			/>

			<ConfirmDialog
				title='Видалити підкатегорію'
				text={`Ви впевнені, що хочете видалити підкатегорію "${
					subcategoryToDelete?.name || ''
				}"? Цю дію неможливо скасувати.`}
				isOpen={deleteSubcategoryConfirmOpen}
				onClose={handleDeleteSubcategoryCancel}
				onDestroy={handleDeleteSubcategoryConfirm}
				onCancel={handleDeleteSubcategoryCancel}
				destroyText='Видалити'
				cancelText='Скасувати'
			/>

			<ConfirmDialog
				title='Видалити тип послуги'
				text='Ви впевнені, що хочете видалити цей тип послуги? Цю дію неможливо скасувати.'
				isOpen={deleteTypeConfirmOpen}
				onClose={handleDeleteTypeCancel}
				onDestroy={handleDeleteTypeConfirm}
				onCancel={handleDeleteTypeCancel}
				destroyText='Видалити'
				cancelText='Скасувати'
			/>
		</>
	)
}

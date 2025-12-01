'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Category } from '@/types'
import { useService } from '@/stores/service/useService'

interface Subcategory {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	category?: Category
}

interface AddSubcategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: () => void
	categoryId: number | null
	subcategory: Subcategory | null
}

export default function AddSubcategoryModal({
	isOpen,
	onClose,
	onSave,
	categoryId: initialCategoryId,
	subcategory,
}: AddSubcategoryModalProps) {
	const [name, setName] = useState('')
	const [icon, setIcon] = useState('')
	const [description, setDescription] = useState('')
	const [categoryId, setCategoryId] = useState<string>(
		initialCategoryId?.toString() || ''
	)
	const { categories, fetchCategories } = useService()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (isOpen) {
			fetchCategories()
		}
	}, [isOpen, fetchCategories])

	useEffect(() => {
		if (subcategory) {
			setName(subcategory.name)
			setIcon(subcategory.icon || '')
			setDescription(subcategory.description || '')
			setCategoryId(
				subcategory.category?.id.toString() ||
					initialCategoryId?.toString() ||
					''
			)
		} else {
			setName('')
			setIcon('')
			setDescription('')
			setCategoryId(initialCategoryId?.toString() || '')
		}
		setError('')
	}, [subcategory, isOpen, initialCategoryId])

	const generateSlug = (text: string) => {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (!name.trim()) {
			setError("Назва підкатегорії обов'язкова")
			return
		}

		if (!categoryId) {
			setError('Категорія не вибрана')
			return
		}

		setLoading(true)

		try {
			const slug = generateSlug(name)
			const url = subcategory
				? `/api/services/subcategories/${subcategory.id}`
				: '/api/services/subcategories'
			const method = subcategory ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name.trim(),
					slug,
					icon: icon.trim() || null,
					description: description.trim() || null,
					categoryId: parseInt(categoryId),
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка збереження підкатегорії')
			}

			onSave()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка збереження')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={subcategory ? 'Редагувати підкатегорію' : 'Додати підкатегорію'}
			size='md'
			footer={
				<div className='flex gap-2 justify-end'>
					<Button variant='outline' onClick={onClose} disabled={loading}>
						Скасувати
					</Button>
					<Button onClick={handleSubmit} loading={loading}>
						Зберегти
					</Button>
				</div>
			}
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>
						Категорія <span className='text-destructive'>*</span>
					</label>
					<Select
						value={categoryId}
						onValueChange={setCategoryId}
					>
						<SelectTrigger className='h-11'>
							<SelectValue placeholder='Оберіть категорію' />
						</SelectTrigger>
						<SelectContent>
							{categories.map(cat => (
								<SelectItem key={cat.id} value={cat.id.toString()}>
									{cat.icon && <span className='mr-2'>{cat.icon}</span>}
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{error && !categoryId && (
						<div className='text-destructive text-sm'>{error}</div>
					)}
				</div>

				<Input
					label='Назва підкатегорії'
					placeholder='Наприклад: Веб-розробка'
					value={name}
					onChange={e => setName(e.target.value)}
					required
					error={!!(error && !name.trim())}
					errorMessage={error && !name.trim() ? error : undefined}
				/>

				<Input
					label='Іконка (емодзі)'
					placeholder='Наприклад: 🌐'
					value={icon}
					onChange={e => setIcon(e.target.value)}
					helperText='Введіть емодзі для відображення підкатегорії'
				/>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>Опис</label>
					<Textarea
						placeholder='Опис підкатегорії...'
						value={description}
						onChange={e => setDescription(e.target.value)}
						rows={4}
					/>
				</div>

				{error && name.trim() && (
					<div className='text-destructive text-sm'>{error}</div>
				)}
			</form>
		</Modal>
	)
}


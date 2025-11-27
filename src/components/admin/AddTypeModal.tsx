'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Type {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
}

interface AddTypeModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: () => void
	subcategoryId: number | null
	type: Type | null
}

export default function AddTypeModal({
	isOpen,
	onClose,
	onSave,
	subcategoryId,
	type,
}: AddTypeModalProps) {
	const [name, setName] = useState('')
	const [icon, setIcon] = useState('')
	const [description, setDescription] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (type) {
			setName(type.name)
			setIcon(type.icon || '')
			setDescription(type.description || '')
		} else {
			setName('')
			setIcon('')
			setDescription('')
		}
		setError('')
	}, [type, isOpen])

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
			setError("Назва типу послуги обов'язкова")
			return
		}

		if (!subcategoryId) {
			setError('Підкатегорія не вибрана')
			return
		}

		setLoading(true)

		try {
			const slug = generateSlug(name)
			const url = type ? `/api/admin/types/${type.id}` : '/api/admin/types'
			const method = type ? 'PUT' : 'POST'

			// Получаем categoryId из subcategory
			const subcategoryResponse = await fetch(
				`/api/admin/subcategories/${subcategoryId}`
			)
			const subcategoryData = await subcategoryResponse.json()

			if (!subcategoryResponse.ok) {
				throw new Error('Помилка отримання підкатегорії')
			}

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
					categoryId: subcategoryData.subcategory.categoryId,
					subcategoryId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка збереження типу послуги')
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
			title={type ? 'Редагувати тип послуги' : 'Додати тип послуги'}
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
				<Input
					label='Назва типу послуги'
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
					helperText='Введіть емодзі для відображення типу послуги'
				/>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>Опис</label>
					<Textarea
						placeholder='Опис типу послуги...'
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


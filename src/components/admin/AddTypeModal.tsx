'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useService } from '@/stores/service/useService'
import {
	createTypeSchema,
	type CreateTypeSchema,
	type UpdateTypeSchema,
} from '@/lib/schemas'
import type { z } from 'zod'

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

type FormData = z.infer<typeof createTypeSchema>

export default function AddTypeModal({
	isOpen,
	onClose,
	onSave,
	subcategoryId,
	type,
}: AddTypeModalProps) {
	const { subcategories, createType, updateType, fetchSubcategories } =
		useService()

	const {
		handleSubmit,
		reset,
		register,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(createTypeSchema),
		defaultValues: {
			name: '',
			categoryId: 0,
			subcategoryId: null,
			icon: '',
			description: '',
		},
	})

	useEffect(() => {
		if (isOpen) {
			fetchSubcategories()
		}
	}, [isOpen, fetchSubcategories])

	useEffect(() => {
		if (type && subcategoryId) {
			const subcategory = subcategories.find(sub => sub.id === subcategoryId)
			if (subcategory) {
				reset({
					name: type.name,
					categoryId: subcategory.category.id,
					subcategoryId: subcategoryId,
					slug: type.slug || '',
					icon: type.icon || '',
					description: type.description || '',
				} as FormData & { slug?: string })
			}
		} else if (subcategoryId) {
			const subcategory = subcategories.find(sub => sub.id === subcategoryId)
			if (subcategory) {
				reset({
					name: '',
					categoryId: subcategory.category.id,
					subcategoryId: subcategoryId,
					icon: '',
					description: '',
				})
			}
		}
	}, [type, subcategoryId, isOpen, subcategories, reset])

	const onSubmit = async (data: FormData & { slug?: string }) => {
		try {
			if (type) {
				// Обновление типа
				const updateData: UpdateTypeSchema = {
					name: data.name.trim(),
					slug: data.slug?.trim() || null,
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
					...(data.categoryId && { categoryId: data.categoryId }),
					...(data.subcategoryId !== subcategoryId && {
						subcategoryId: data.subcategoryId,
					}),
				}

				await updateType(type.id, updateData)
			} else {
				// Создание типа
				const createData: CreateTypeSchema = {
					name: data.name.trim(),
					categoryId: data.categoryId,
					subcategoryId: data.subcategoryId,
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
				}

				await createType(createData)
			}

			onSave()
		} catch (error) {
			console.error('Error saving type:', error)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={type ? 'Редагувати тип послуги' : 'Додати тип послуги'}
			size='md'
			classNameContent='overflow-y-auto'
			footer={
				<div className='flex gap-2 justify-end'>
					<Button variant='outline' onClick={onClose} disabled={isSubmitting}>
						Скасувати
					</Button>
					<Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
						Зберегти
					</Button>
				</div>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<Input
					label='Назва типу послуги'
					placeholder='Наприклад: Веб-розробка'
					{...register('name')}
					required
				/>

				<Input
					label='Іконка (емодзі)'
					placeholder='Наприклад: 🌐'
					{...register('icon')}
					helperText='Введіть емодзі для відображення типу послуги'
				/>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>Опис</label>
					<Textarea
						placeholder='Опис типу послуги...'
						{...register('description')}
						rows={4}
					/>
				</div>

				{Object.keys(errors).length > 0 && (
					<div className='text-destructive text-sm'>
						{Object.values(errors)
							.filter(error => error?.message)
							.map((error, index) => (
								<div key={index}>{error?.message}</div>
							))}
					</div>
				)}
			</form>
		</Modal>
	)
}

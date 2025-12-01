'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Subcategory } from '@/types'
import { useService } from '@/stores/service/useService'
import {
	createSubcategorySchema,
	type CreateSubcategorySchema,
	type UpdateSubcategorySchema,
} from '@/lib/schemas'

interface AddSubcategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: () => void
	categoryId: number | null
	subcategory: Subcategory | null
}

type FormData = {
	name: string
	categoryId: number
	slug?: string | null
	icon?: string | null
	description?: string | null
}

export default function AddSubcategoryModal({
	isOpen,
	onClose,
	onSave,
	categoryId: initialCategoryId,
	subcategory,
}: AddSubcategoryModalProps) {
	const { categories, fetchCategories, createSubcategory, updateSubcategory } =
		useService()

	const {
		handleSubmit,
		reset,
		register,
		control,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(createSubcategorySchema),
		defaultValues: {
			name: '',
			categoryId: initialCategoryId ?? subcategory?.category?.id ?? 0,
			slug: '',
			icon: '',
			description: '',
		},
	})

	useEffect(() => {
		if (isOpen) {
			fetchCategories()
		}
	}, [isOpen, fetchCategories])

	useEffect(() => {
		if (subcategory) {
			reset({
				name: subcategory.name,
				categoryId: subcategory.category?.id || initialCategoryId || 0,
				slug: subcategory.slug || '',
				icon: subcategory.icon || '',
				description: subcategory.description || '',
			})
		} else {
			reset({
				name: '',
				categoryId: initialCategoryId || 0,
				slug: '',
				icon: '',
				description: '',
			})
		}
	}, [subcategory, isOpen, initialCategoryId, reset])

	const generateSlug = (text: string): string | null => {
		if (!text || !text.trim()) return null
		const slug = text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
		return slug || null
	}

	const onSubmit = async (data: FormData) => {
		try {
			const trimmedName = data.name.trim()
			if (!trimmedName) {
				console.error('Name is required')
				return
			}

			const slug = generateSlug(trimmedName)

			if (subcategory) {
				// Обновление подкатегории
				const updateData: UpdateSubcategorySchema = {
					name: trimmedName,
					slug: slug || null,
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
					...(data.categoryId !== subcategory.category?.id && {
						categoryId: data.categoryId,
					}),
				}

				await updateSubcategory(subcategory.id, updateData)
			} else {
				// Создание подкатегории
				const createData: CreateSubcategorySchema = {
					name: trimmedName,
					categoryId: data.categoryId,
					slug: slug || null,
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
				}

				await createSubcategory(createData)
			}

			onSave()
		} catch (error) {
			console.error('Error saving subcategory:', error)
			// Ошибка уже обработана в store, здесь просто логируем
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={subcategory ? 'Редагувати підкатегорію' : 'Додати підкатегорію'}
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
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-4 overflow-visible'
			>
				<div className='space-y-2 relative z-10'>
					<label className='text-sm font-medium text-gray-900'>
						Категорія <span className='text-destructive'>*</span>
					</label>
					<Controller
						name='categoryId'
						control={control}
						rules={{ required: "Категорія обов'язкова" }}
						render={({ field }) => (
							<Select
								value={
									field.value !== undefined &&
									field.value !== null &&
									field.value > 0
										? field.value.toString()
										: undefined
								}
								onValueChange={value => {
									const numValue = parseInt(value, 10)
									if (!isNaN(numValue) && numValue > 0) {
										field.onChange(numValue)
										field.onBlur()
									}
								}}
							>
								<SelectTrigger className='h-11'>
									<SelectValue placeholder='Оберіть категорію' />
								</SelectTrigger>
								<SelectContent
									className='z-[200] max-h-[300px]'
									position='popper'
									sideOffset={4}
								>
									{categories.map(cat => (
										<SelectItem key={cat.id} value={cat.id.toString()}>
											{cat.icon && <span className='mr-2'>{cat.icon}</span>}
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.categoryId && (
						<div className='text-destructive text-sm'>
							{errors.categoryId.message}
						</div>
					)}
				</div>

				<Input
					label='Назва підкатегорії'
					placeholder='Наприклад: Веб-розробка'
					{...register('name')}
					required
					errorMessage={errors.name?.message}
				/>

				<Input
					label='Іконка (емодзі)'
					placeholder='Наприклад: 🌐'
					{...register('icon')}
					helperText='Введіть емодзі для відображення підкатегорії'
				/>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>Опис</label>
					<Textarea
						placeholder='Опис підкатегорії...'
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

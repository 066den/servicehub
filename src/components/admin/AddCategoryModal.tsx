'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getSession } from 'next-auth/react'
import { Category } from '@/types'
import { useService } from '@/stores/service/useService'
import {
	createCategorySchema,
	updateCategorySchema,
	type CreateCategorySchema,
	type UpdateCategorySchema,
} from '@/lib/schemas'
import type { z } from 'zod'
import ImageEditable from '../ui/ImageEditable'
import { ASPECT_RATIOS } from '@/lib/aspectRatios'
import { Label } from '../ui/label'

interface AddCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: () => void
	category: Category | null
}

type FormData = z.infer<typeof createCategorySchema> & { slug?: string }

export default function AddCategoryModal({
	isOpen,
	onClose,
	onSave,
	category,
}: AddCategoryModalProps) {
	const { createCategory, updateCategory, fetchCategories } = useService()
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [currentImage, setCurrentImage] = useState<string | null>(null)
	const [uploadingImage, setUploadingImage] = useState(false)

	const {
		handleSubmit,
		reset,
		register,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(
			category ? updateCategorySchema : createCategorySchema
		),
		defaultValues: {
			name: '',
			icon: '',
			description: '',
		},
	})

	useEffect(() => {
		if (category) {
			reset({
				name: category.name,
				slug: category.slug || '',
				icon: category.icon || '',
				description: category.description || '',
			} as FormData)
			setCurrentImage(category.image || null)
		} else {
			reset({
				name: '',
				icon: '',
				description: '',
			})
			setCurrentImage(null)
		}
		setImageFile(null)
	}, [category, isOpen, reset])

	const categoryName = watch('name')

	const handleImageUpload = (file: File) => {
		setImageFile(file)
		// ImageEditable сам управляет preview через внутреннее состояние
	}

	const handleImageRemove = () => {
		setImageFile(null)
		setCurrentImage(null)
	}

	const uploadImage = async (categoryId: number): Promise<string | null> => {
		if (!imageFile) return null

		setUploadingImage(true)
		try {
			const session = await getSession()
			if (!session?.accessToken) {
				throw new Error('Not authenticated')
			}

			const formData = new FormData()
			formData.append('image', imageFile)

			const response = await fetch(
				`/api/services/categories/${categoryId}/image`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${session.accessToken}`,
					},
					body: formData,
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Помилка завантаження зображення')
			}

			// Возвращаем URL изображения из обновленной категории
			return data.category?.image || data.imageUrl || null
		} catch (err) {
			throw err
		} finally {
			setUploadingImage(false)
		}
	}

	const deleteImage = async (categoryId: number): Promise<void> => {
		const originalImage = category?.image
		if (!originalImage) return

		// Если было изображение, но его удалили
		if (originalImage && !currentImage) {
			setUploadingImage(true)
			try {
				const session = await getSession()
				if (!session?.accessToken) {
					throw new Error('Not authenticated')
				}

				const response = await fetch(
					`/api/services/categories/${categoryId}/image`,
					{
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${session.accessToken}`,
						},
					}
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(data.error || 'Помилка видалення зображення')
				}
			} catch (err) {
				throw err
			} finally {
				setUploadingImage(false)
			}
		}
	}

	const onSubmit = async (data: FormData & { slug?: string }) => {
		try {
			let categoryId: number | null = null

			if (category) {
				// Обновление категории
				const updateData: UpdateCategorySchema = {
					name: data.name.trim(),
					slug: data.slug?.trim() || null,
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
				}

				const updated = await updateCategory(category.id, updateData)
				if (updated) {
					categoryId = updated.id
				}
			} else {
				// Создание категории
				const createData: CreateCategorySchema = {
					name: data.name.trim(),
					icon: data.icon?.trim() || null,
					description: data.description?.trim() || null,
				}

				const created = await createCategory(createData)
				if (created) {
					categoryId = created.id
				}
			}

			if (categoryId) {
				// Загружаем новое изображение, если оно выбрано
				if (imageFile) {
					await uploadImage(categoryId)
					// Обновляем список категорий для получения актуального изображения
					await fetchCategories(true)
				}
				// Удаляем изображение, если оно было удалено
				else if (category?.image && !currentImage) {
					await deleteImage(categoryId)
					// Обновляем список категорий после удаления изображения
					await fetchCategories(true)
				}
			}

			onSave()
		} catch (error) {
			console.error('Error saving category:', error)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={category ? 'Редагувати категорію' : 'Додати категорію'}
			size='lg'
			classNameContent='overflow-y-auto'
			footer={
				<div className='flex gap-2 justify-end'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isSubmitting || uploadingImage}
					>
						Скасувати
					</Button>
					<Button
						onClick={handleSubmit(onSubmit)}
						loading={isSubmitting || uploadingImage}
						disabled={uploadingImage}
					>
						Зберегти
					</Button>
				</div>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<Input
					label='Назва категорії'
					placeholder='Наприклад: IT та технології'
					{...register('name')}
					required
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label='Іконка (емодзі)'
						placeholder='Наприклад: 💻'
						{...register('icon')}
						helperText='Введіть емодзі для відображення категорії'
					/>
					{/* Загрузка изображения */}
					<div className='space-y-2'>
						<Label>Зображення категорії</Label>
						<ImageEditable
							src={currentImage || undefined}
							alt={categoryName || 'Категорія'}
							onUpload={handleImageUpload}
							aspectRatio={ASPECT_RATIOS.LANDSCAPE}
							showCrop={true}
							size='large'
							className='w-full'
						/>
						{currentImage && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={handleImageRemove}
								disabled={uploadingImage}
								className='w-full'
							>
								Видалити зображення
							</Button>
						)}
					</div>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-900'>Опис</label>
					<Textarea
						placeholder='Опис категорії...'
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

'use client'

import { useState, useEffect } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { X, Plus } from 'lucide-react'
import { apiRequestAuth } from '@/lib/api'
import { toast } from 'sonner'
import Image from 'next/image'
import { ServicePhoto } from '@/types'
import { Dropzone } from '../ui/dropzone'
import { validateFile } from '@/lib/validate'

interface ServiceGalleryProps {
	serviceId: number | null
	initialPhotos?: ServicePhoto[]
	onPhotosChange?: (
		photos: Array<{ id?: number; file?: File; url: string }>
	) => void
}

interface GalleryPhoto {
	id?: number
	file?: File
	url: string
	isNew?: boolean
}

const ServiceGallery = ({
	serviceId,
	initialPhotos = [],
	onPhotosChange,
}: ServiceGalleryProps) => {
	const [photos, setPhotos] = useState<GalleryPhoto[]>([])
	const [isUploading, setIsUploading] = useState(false)

	// Инициализируем фото из initialPhotos
	useEffect(() => {
		if (initialPhotos && initialPhotos.length > 0) {
			setPhotos(
				initialPhotos.map(photo => ({
					id: photo.id,
					url: photo.url,
					isNew: false,
				}))
			)
		}
	}, [initialPhotos])

	const handleFilesSelect = async (
		acceptedFiles: File[],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_fileRejections: unknown[],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_event: unknown
	) => {
		const files = acceptedFiles
		if (!serviceId) {
		// Если услуга еще не создана, сохраняем файлы для загрузки позже
		const newPhotos: GalleryPhoto[] = files.map(file => ({
			file,
			url: URL.createObjectURL(file),
			isNew: true,
		}))
		const updatedPhotos = [...photos, ...newPhotos]
		setPhotos(updatedPhotos)
		onPhotosChange?.(
			updatedPhotos.map(p => ({
				id: p.id,
				file: p.file,
				url: p.url,
			}))
		)
		return
		}

		// Валидация файлов
		for (const file of files) {
			const validation = validateFile(file)
			if (validation) {
				toast.error(`${file.name}: ${validation}`)
				return
			}
		}

		setIsUploading(true)
		try {
			const formData = new FormData()
			files.forEach(file => {
				formData.append('photos', file)
			})

			const response = await apiRequestAuth<{
				success: boolean
				photos: ServicePhoto[]
			}>(`/api/user/provider/services/${serviceId}/photos`, {
				method: 'POST',
				body: formData,
			})

			if (response.success) {
				const newPhotos: GalleryPhoto[] = response.photos.map(photo => ({
					id: photo.id,
					url: photo.url,
					isNew: false,
				}))
				const updatedPhotos = [...photos, ...newPhotos]
				setPhotos(updatedPhotos)
				onPhotosChange?.(
					updatedPhotos.map(p => ({
						id: p.id,
						file: p.file,
						url: p.url,
					}))
				)
				toast.success(`Завантажено ${response.photos.length} фото`)
			}
		} catch (error) {
			console.error('Error uploading photos:', error)
			toast.error('Помилка завантаження фото')
		} finally {
			setIsUploading(false)
		}
	}

	const handleDelete = async (photo: GalleryPhoto) => {
		// Если фото еще не загружено на сервер
		if (photo.isNew && photo.file) {
			const updatedPhotos = photos.filter(p => p.url !== photo.url)
			setPhotos(updatedPhotos)
			onPhotosChange?.(
				updatedPhotos.map(p => ({
					id: p.id,
					file: p.file,
					url: p.url,
				}))
			)
			URL.revokeObjectURL(photo.url)
			return
		}

		if (!serviceId || !photo.id) {
			return
		}

		setIsUploading(true)
		try {
			const response = await apiRequestAuth<{ success: boolean }>(
				`/api/user/provider/services/${serviceId}/photos/${photo.id}`,
				{
					method: 'DELETE',
				}
			)

			if (response.success) {
				const updatedPhotos = photos.filter(p => p.id !== photo.id)
				setPhotos(updatedPhotos)
				onPhotosChange?.(
					updatedPhotos.map(p => ({
						id: p.id,
						file: p.file,
						url: p.url,
					}))
				)
				toast.success('Фото видалено')
			}
		} catch (error) {
			console.error('Error deleting photo:', error)
			toast.error('Помилка видалення фото')
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<div className='space-y-2 mb-4'>
			<Label>Галерея фото</Label>
			<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{photos.map((photo, index) => (
					<div
						key={photo.id || `new-${index}`}
						className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 group'
					>
						<Image
							src={photo.url}
							alt={`Фото ${index + 1}`}
							fill
							className='object-cover'
						/>
						<Button
							type='button'
							variant='destructive'
							size='icon'
							className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
							onClick={() => handleDelete(photo)}
							disabled={isUploading}
						>
							<X className='size-4' />
						</Button>
					</div>
				))}

				<Dropzone
					onDrop={handleFilesSelect}
					accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
					maxSize={10 * 1024 * 1024}
					maxFiles={10}
					className='aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer'
				>
					<div className='text-center p-4'>
						<Plus className='size-8 mx-auto mb-2 text-gray-400' />
						<p className='text-sm text-gray-600'>Додати фото</p>
					</div>
				</Dropzone>
			</div>
			{isUploading && (
				<p className='text-sm text-muted-foreground'>Завантаження фото...</p>
			)}
			{photos.some(p => p.isNew) && !serviceId && (
				<p className='text-sm text-muted-foreground'>
					Фото будуть завантажені після збереження послуги
				</p>
			)}
		</div>
	)
}

export default ServiceGallery


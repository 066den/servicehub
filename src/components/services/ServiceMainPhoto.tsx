'use client'

import { useState, useEffect } from 'react'
import ImageEditable from '../ui/ImageEditable'
import { Label } from '../ui/label'
import { apiRequestAuth } from '@/lib/api'
import { toast } from 'sonner'
import { ASPECT_RATIOS } from '@/lib/aspectRatios'

interface ServiceMainPhotoProps {
	serviceId: number | null
	initialPhotoUrl?: string | null
	onPhotoChange?: (url: string | null, file?: File | null) => void
}

const ServiceMainPhoto = ({
	serviceId,
	initialPhotoUrl,
	onPhotoChange,
}: ServiceMainPhotoProps) => {
	const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null)
	const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(
		initialPhotoUrl || null
	)
	const [isUploading, setIsUploading] = useState(false)

	// Синхронизируем с внешним initialPhotoUrl
	useEffect(() => {
		if (initialPhotoUrl) {
			setMainPhotoUrl(initialPhotoUrl)
		}
	}, [initialPhotoUrl])

	const handleFileSelect = (file: File) => {
		setMainPhotoFile(file)
		const url = URL.createObjectURL(file)
		setMainPhotoUrl(url)
		onPhotoChange?.(url, file)
	}

	const handleUpload = async () => {
		if (!mainPhotoFile || !serviceId) {
			return
		}

		setIsUploading(true)
		try {
			const formData = new FormData()
			formData.append('photo', mainPhotoFile)

			const response = await apiRequestAuth<{
				success: boolean
				photo: { url: string }
			}>(`/api/user/provider/services/${serviceId}/main-photo`, {
				method: 'POST',
				body: formData,
			})

			if (response.success) {
				setMainPhotoFile(null)
				setMainPhotoUrl(response.photo.url)
				onPhotoChange?.(response.photo.url, null)
				toast.success('Головне фото успішно завантажено')
			}
		} catch (error) {
			console.error('Error uploading main photo:', error)
			toast.error('Помилка завантаження головного фото')
		} finally {
			setIsUploading(false)
		}
	}

	// Автоматически загружаем фото при выборе, если serviceId есть
	useEffect(() => {
		if (mainPhotoFile && serviceId) {
			handleUpload()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mainPhotoFile, serviceId])

	return (
		<div className='space-y-2 mb-4'>
			<Label>Головне фото (превью)</Label>

			<ImageEditable
				src={mainPhotoUrl || undefined}
				alt='Головне фото послуги'
				onUpload={handleFileSelect}
				showCrop={true}
				aspectRatio={ASPECT_RATIOS.LANDSCAPE}
				size='medium'
				className='w-full'
			/>

			{mainPhotoFile && serviceId && isUploading && (
				<p className='text-sm text-muted-foreground'>Завантаження фото...</p>
			)}
			{mainPhotoFile && !serviceId && (
				<p className='text-sm text-muted-foreground'>
					Фото буде завантажено після збереження послуги
				</p>
			)}
		</div>
	)
}

export default ServiceMainPhoto

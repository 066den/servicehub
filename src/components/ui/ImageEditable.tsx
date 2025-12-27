import { Dropzone, DropzoneEmptyState } from '@/components/ui/dropzone'
import { ImageCropper } from './ImageCropper'

import { toast } from 'sonner'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { validateFile } from '@/lib/validate'
import { ASPECT_RATIOS } from '@/lib/aspectRatios'
import { useTranslations } from 'next-intl'
import { X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageEditableProps {
	src?: string
	alt?: string
	onUpload?: (file: File) => void
	onRemove?: () => void
	aspectRatio?: number
	showCrop?: boolean
	className?: string
	size?: 'small' | 'medium' | 'large'
}

const ImageEditable = ({
	src,
	alt,
	onUpload,
	onRemove,
	aspectRatio,
	showCrop = true,
	className,
	size = 'medium',
}: ImageEditableProps) => {
	const t = useTranslations()
	const [cropImage, setCropImage] = useState<string | null>(null)
	const [isCropping, setIsCropping] = useState(false)
	const [imgUrl, setImgUrl] = useState<string>(src || '')
	const [hasLocalImage, setHasLocalImage] = useState(false)

	// Синхронизируем imgUrl с внешним src
	useEffect(() => {
		if (src) {
			setImgUrl(src)
			setHasLocalImage(false)
		} else if (!hasLocalImage && !cropImage && !isCropping) {
			// Очищаем только если нет локального изображения и не идет процесс кропа
			setImgUrl('')
		}
	}, [cropImage, isCropping, src, hasLocalImage])

	const handleDrop = async (files: File[]) => {
		const file = files[0]
		const validation = validateFile(file)
		if (validation) {
			toast.error(validation)
			return
		}

		if (showCrop) {
			// Create URL for preview
			const imageUrl = URL.createObjectURL(file)
			setCropImage(imageUrl)
			setIsCropping(true)
		} else {
			onSelectFile(file)
		}
	}

	const handleCropComplete = async (croppedFile: File) => {
		onSelectFile(croppedFile)
		setIsCropping(false)
		setCropImage(null)
	}

	const handleCropCancel = () => {
		setIsCropping(false)
		if (cropImage) {
			URL.revokeObjectURL(cropImage)
			setCropImage(null)
		}
		// Если отменили кроп и нет локального изображения, очищаем imgUrl
		if (!hasLocalImage && !src) {
			setImgUrl('')
		}
	}

	const onSelectFile = (file: File) => {
		const imgUrl = URL.createObjectURL(file)
		setImgUrl(imgUrl)
		setHasLocalImage(true)
		onUpload?.(file)
	}

	const handleError = (error: Error) => {
		toast.error(error.message)
	}

	const handleRemove = () => {
		if (hasLocalImage && imgUrl) {
			URL.revokeObjectURL(imgUrl)
		}
		setImgUrl('')
		setHasLocalImage(false)
		onRemove?.()
	}

	const maxFileSize = 5 * 1024 * 1024 // 5MB

	return (
		<div className={className}>
			<Dropzone
				onDrop={handleDrop}
				accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
				maxSize={maxFileSize}
				onError={handleError}
				className={`relative w-full ${
					aspectRatio === ASPECT_RATIOS.SQUARE
						? 'aspect-[1/1]'
						: aspectRatio === ASPECT_RATIOS.LANDSCAPE
						? 'aspect-[16/9]'
						: aspectRatio === ASPECT_RATIOS.CLASSIC
						? 'aspect-[4/3]'
						: 'aspect-[1/1]'
				} ${
					size === 'small'
						? 'max-w-[160px]'
						: size === 'medium'
						? 'max-w-[250px]'
						: 'max-w-[400px]'
				}`}
			>
				{!imgUrl ? (
					<DropzoneEmptyState>
						<div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer w-full h-full flex flex-col items-center justify-center whitespace-normal'>
							<div
								className={`${size === 'small' ? 'text-2xl' : 'text-4xl'} mb-2`}
							>
								📁
							</div>
							<div
								className={`font-medium ${
									size === 'small' ? 'text-xs' : 'text-base'
								} text-gray-700 mb-1`}
							>
								{t('ImageEditable.dragDropOrClick')}
							</div>
							<div className='text-sm text-gray-500'>
								{t('ImageEditable.between', {
									maxSize: (maxFileSize / 1024 / 1024).toFixed(2),
								})}
							</div>
						</div>
					</DropzoneEmptyState>
				) : (
					<div className='relative w-full h-full rounded-lg overflow-hidden group'>
						<Image
							alt={alt || 'Preview'}
							className='w-full h-full object-cover'
							fill
							sizes='400px'
							src={imgUrl}
							priority
						/>
						<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
							<div
								role='button'
								tabIndex={0}
								className={cn(
									'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 cursor-pointer',
									'px-3 py-2 text-sm',
									'bg-white shadow-xs hover:bg-white/90',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20',
									'disabled:pointer-events-none disabled:opacity-50'
								)}
							>
								<RefreshCw className='size-4' />
							</div>
							<div
								role='button'
								tabIndex={0}
								onClick={e => {
									e.stopPropagation()
									handleRemove()
								}}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										e.stopPropagation()
										handleRemove()
									}
								}}
								className={cn(
									'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 cursor-pointer',
									'px-3 py-2 text-sm',
									'bg-destructive text-white shadow-xs hover:bg-destructive/90',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20',
									'disabled:pointer-events-none disabled:opacity-50'
								)}
							>
								<X className='size-4' />
							</div>
						</div>
					</div>
				)}
			</Dropzone>

			{isCropping && cropImage && (
				<ImageCropper
					src={cropImage}
					aspectRatio={aspectRatio}
					onCropComplete={handleCropComplete}
					onCancel={handleCropCancel}
				/>
			)}
		</div>
	)
}

export default ImageEditable

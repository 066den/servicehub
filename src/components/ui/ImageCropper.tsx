'use client'

import { useCallback, useRef, useState } from 'react'
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	Crop,
	PixelCrop,
} from 'react-image-crop'
import { Button } from './button'
import { CheckIcon, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
	src: string
	aspectRatio?: number | undefined
	onCropComplete?: (croppedFile: File) => void
	onCancel?: () => void
}

export const ImageCropper = ({
	src,
	aspectRatio,
	onCropComplete,
	onCancel,
}: ImageCropperProps) => {
	const t = useTranslations()
	const [crop, setCrop] = useState<Crop>()
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
	const imgRef = useRef<HTMLImageElement>(null)
	const previewCanvasRef = useRef<HTMLCanvasElement>(null)

	const onImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { width, height } = e.currentTarget

			if (aspectRatio !== undefined) {
				// Initialize with a centered crop for aspect ratio
				const crop = centerCrop(
					makeAspectCrop(
						{
							unit: '%',
							width: 90,
						},
						aspectRatio,
						width,
						height
					),
					width,
					height
				)
				setCrop(crop)
			} else {
				// No aspect ratio - free crop
				const crop: Crop = {
					unit: '%',
					x: 5,
					y: 5,
					width: 90,
					height: 90,
				}
				setCrop(crop)
			}
		},
		[aspectRatio]
	)

	const handleReset = useCallback(() => {
		setCrop(undefined)
		setCompletedCrop(undefined)
	}, [])

	const handleCropComplete = useCallback(async () => {
		if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
			return
		}

		try {
			const image = imgRef.current

			// Calculate scale from rendered size to natural size
			const scaleX = image.naturalWidth / image.width
			const scaleY = image.naturalHeight / image.height

			// Account for device pixel ratio for sharper result
			const pixelRatio =
				typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

			// Create canvas with the dimensions of the cropped image in natural pixels
			const croppedCanvas = document.createElement('canvas')
			const ctx = croppedCanvas.getContext('2d', { willReadFrequently: true })

			if (!ctx) return

			const cropWidth = Math.round(completedCrop.width * scaleX)
			const cropHeight = Math.round(completedCrop.height * scaleY)
			const cropX = Math.round(completedCrop.x * scaleX)
			const cropY = Math.round(completedCrop.y * scaleY)

			croppedCanvas.width = Math.max(1, Math.floor(cropWidth * pixelRatio))
			croppedCanvas.height = Math.max(1, Math.floor(cropHeight * pixelRatio))

			// Ensure drawing scales back down for display size
			ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
			ctx.imageSmoothingQuality = 'high'

			// Fill with white background to avoid black background in JPEG
			ctx.fillStyle = 'white'
			ctx.fillRect(0, 0, cropWidth, cropHeight)

			// Draw the cropped part of the image from the natural-sized coordinates
			ctx.drawImage(
				image,
				cropX,
				cropY,
				cropWidth,
				cropHeight,
				0,
				0,
				cropWidth,
				cropHeight
			)

			// Convert canvas to Blob, then to File
			return new Promise<void>(resolve => {
				croppedCanvas.toBlob(
					blob => {
						if (blob) {
							const file = new File([blob], 'cropped-image.jpg', {
								type: 'image/jpeg',
							})
							onCropComplete?.(file)
						}
						resolve()
					},
					'image/jpeg',
					0.9
				)
			})
		} catch (error) {
			console.error('Crop error:', error)
		}
	}, [completedCrop, onCropComplete])

	return (
		<div className='fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
			<div className='relative max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden'>
				<Button
					variant='ghost'
					size='round'
					className='absolute top-3 right-3 z-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100'
					onClick={onCancel}
					aria-label='Закрити'
				>
					<X size={20} />
				</Button>

				<div className='px-8 py-4 border-b border-gray-100'>
					<h3 className='text-xl font-semibold text-gray-800'>
						{t('ImageCropper.title')}
					</h3>
					<p className='text-sm text-gray-600 mt-1'>
						{t('ImageCropper.description')}
					</p>
				</div>

				<div className='px-8 py-6 flex flex-col items-center space-y-4'>
					<ReactCrop
						crop={crop}
						onChange={(_, percentCrop) => {
							setCrop(percentCrop)
						}}
						onComplete={c => setCompletedCrop(c)}
						aspect={aspectRatio}
						className='max-w-full max-h-[60vh]'
						minWidth={20}
						minHeight={20}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							ref={imgRef}
							alt={t('ImageEditable.preview')}
							src={src}
							style={{ maxHeight: '60vh', maxWidth: '100%' }}
							onLoad={onImageLoad}
						/>
					</ReactCrop>

					<div className='flex gap-2 w-full justify-center'>
						<Button
							size='md'
							onClick={handleCropComplete}
							disabled={!completedCrop}
						>
							<CheckIcon />
							{t('apply')}
						</Button>
						<Button size='md' variant='outline-primary' onClick={handleReset}>
							{t('reset')}
						</Button>
						<Button size='md' variant='outline-primary' onClick={onCancel}>
							{t('cancel')}
						</Button>
					</div>
				</div>

				{/* Hidden canvas for preview */}
				<canvas
					ref={previewCanvasRef}
					style={{
						display: 'none',
					}}
				/>
			</div>
		</div>
	)
}

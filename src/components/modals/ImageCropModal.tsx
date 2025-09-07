import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import Croppie from 'croppie'
import 'croppie/croppie.css'
import { Button } from '../ui/button'
import { CheckIcon } from 'lucide-react'

type Props = {
	isOpen: boolean
	imageUrl: string
	onClose: () => void
	onCrop: (file: File) => void
	cropSize?: number
	title?: string
}

const ImageCropModal = ({
	isOpen,
	imageUrl,
	onClose,
	onCrop,
	cropSize = 200,
	title = 'Перетягніть і змініть розмір',
}: Props) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const croppieRef = useRef<Croppie | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		// Функция для инициализации с проверкой готовности DOM
		const initializeWhenReady = () => {
			if (containerRef.current && !croppieRef.current) {
				const rect = containerRef.current.getBoundingClientRect()

				if (rect.width > 0 && rect.height > 0) {
					initializeCroppie()
				} else {
					setTimeout(initializeWhenReady, 50)
				}
			}
		}

		if (!containerRef.current) {
			const timer = setTimeout(() => {
				initializeWhenReady()
			}, 100)
			return () => clearTimeout(timer)
		}

		if (croppieRef.current) {
			return
		}

		initializeWhenReady()

		function initializeCroppie() {
			if (!containerRef.current) {
				setError('Container not ready')
				return
			}

			const options: Croppie.CroppieOptions = {
				viewport: {
					width: cropSize,
					height: cropSize,
					type: 'circle', // Круглый вьюпорт для аватаров
				},
				boundary: {
					width: cropSize + 40,
					height: cropSize + 40,
				},
				enableOrientation: true,
				enableExif: true,
			}

			try {
				// Создаем экземпляр Croppie
				croppieRef.current = new Croppie(containerRef.current, options)

				// Загружаем изображение
				croppieRef.current
					.bind({
						url: imageUrl,
						zoom: 0, // Автоматический зум для заполнения области
					})
					.then(() => {
						setError(null)
					})
					.catch(err => {
						console.error('Failed to bind image:', err)
						setError('Failed to load image')
					})
			} catch (err) {
				console.error('Failed to initialize cropper:', err)
				setError('Failed to initialize cropper')
			}
		}

		return () => {
			// Очищаем Croppie при закрытии
			if (croppieRef.current) {
				croppieRef.current.destroy()
				croppieRef.current = null
			}
		}
	}, [isOpen, imageUrl, cropSize])

	const handleCrop = async () => {
		if (!croppieRef.current) {
			setError('Croppie not initialized')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			// Получаем результат кропа как blob
			const result = await croppieRef.current.result({
				type: 'blob',
				size: { width: cropSize, height: cropSize },
			})

			if (result instanceof Blob) {
				const file = new File([result], 'cropped.jpg', { type: 'image/jpeg' })
				onCrop(file)
			} else {
				setError('Failed to create cropped image')
			}
		} catch (err) {
			console.error('Failed to crop image:', err)
			setError('Failed to crop image')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size='sm'>
			<div className='flex flex-col items-center gap-2'>
				<div
					ref={containerRef}
					style={{
						width: cropSize + 40,
						height: cropSize + 40 * 2,
					}}
				/>

				{error && (
					<div className='text-red-500 text-sm text-center max-w-xs bg-red-50 px-4 py-2 rounded-lg border border-red-200'>
						{error}
					</div>
				)}

				<div className='flex justify-end w-full'>
					<Button
						onClick={handleCrop}
						disabled={!!error}
						loading={isLoading}
						size='round'
						title='Confirm crop'
						className='h-12 w-12'
					>
						<CheckIcon className='size-7' />
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ImageCropModal


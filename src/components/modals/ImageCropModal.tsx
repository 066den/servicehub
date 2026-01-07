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
			// Очищаем Croppie при закрытии
			if (croppieRef.current) {
				croppieRef.current.destroy()
				croppieRef.current = null
			}
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

		// Если Croppie уже инициализирован, пересоздаем его для нового изображения
		if (croppieRef.current) {
			croppieRef.current.destroy()
			croppieRef.current = null
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
					type: 'circle', // Круглый viewport для аватаров
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

				// Загружаем изображение и настраиваем масштаб для заполнения viewport
				croppieRef.current
					.bind({
						url: imageUrl,
						zoom: 0, // Автоматический zoom для заполнения
					})
					.then(() => {
						setError(null)
						// Убеждаемся, что изображение заполняет весь viewport
						if (croppieRef.current) {
							// Получаем текущие данные и корректируем zoom если нужно
							const data = croppieRef.current.get()
							if (data && data.zoom !== undefined) {
								// Если zoom слишком мал, увеличиваем его для заполнения
								if (data.zoom < 0) {
									croppieRef.current.setZoom(0)
								}
							}
						}
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
			// Получаем квадратное изображение от Croppie (без circle для правильного масштабирования)
			const squareResult = await croppieRef.current.result({
				type: 'blob',
				size: { width: cropSize, height: cropSize },
				format: 'png',
				circle: false, // Квадратное изображение с правильным масштабированием
			})

			if (!(squareResult instanceof Blob)) {
				setError('Failed to create cropped image')
				return
			}

			// Проверяем, нужно ли дополнительное масштабирование
			// Если изображение уже правильно обрезано, используем его как есть
			const img = new Image()
			img.src = URL.createObjectURL(squareResult)

			await new Promise<void>((resolve, reject) => {
				img.onload = () => {
					try {
						// Если изображение уже правильного размера, используем его напрямую
						if (img.width === cropSize && img.height === cropSize) {
							const file = new File([squareResult], 'cropped.png', {
								type: 'image/png',
							})
							URL.revokeObjectURL(img.src)
							onCrop(file)
							resolve()
							return
						}

						// Иначе создаем canvas и правильно масштабируем
						const canvas = document.createElement('canvas')
						canvas.width = cropSize
						canvas.height = cropSize
						const ctx = canvas.getContext('2d')

						if (!ctx) {
							reject(new Error('Failed to get canvas context'))
							return
						}

						// Масштабируем изображение для заполнения всего квадрата
						// Используем object-cover логику: масштабируем так, чтобы заполнить весь квадрат
						const imgAspect = img.width / img.height
						const targetAspect = 1 // квадрат
						
						let drawWidth, drawHeight, drawX, drawY
						
						if (imgAspect > targetAspect) {
							// Изображение шире - заполняем по высоте
							drawHeight = cropSize
							drawWidth = img.width * (cropSize / img.height)
							drawX = (cropSize - drawWidth) / 2
							drawY = 0
						} else {
							// Изображение выше - заполняем по ширине
							drawWidth = cropSize
							drawHeight = img.height * (cropSize / img.width)
							drawX = 0
							drawY = (cropSize - drawHeight) / 2
						}
						
						ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

						canvas.toBlob(
							(blob) => {
								if (blob) {
									const file = new File([blob], 'cropped.png', {
										type: 'image/png',
									})
									URL.revokeObjectURL(img.src)
									onCrop(file)
									resolve()
								} else {
									reject(new Error('Failed to create blob from canvas'))
								}
							},
							'image/png',
							0.95
						)
					} catch (err) {
						reject(err)
					}
				}
				img.onerror = () => reject(new Error('Failed to load image'))
			})
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
						height: cropSize + 40,
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


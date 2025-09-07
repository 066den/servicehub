import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { getAvatarColor, getFirstLetters } from '@/utils/textFormat'
import ImageCropModal from '../modals/ImageCropModal'
import Image from 'next/image'
import ConfirmDialog from '../modals/ConfirmDialog'
import useFlag from '@/hooks/useFlag'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	src?: string
	alt?: string
	onClick?: () => void
	onUpload?: (file: File) => void
	onRemove?: () => void
}

const AvatarEditable = ({
	className,
	size = 'md',
	onClick,
	src,
	alt,
	onUpload,
	onRemove,
}: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [content, setContent] = useState('')
	const [bgColor, setBgColor] = useState('')
	const [showCropModal, setShowCropModal] = useState(false)
	const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
	const [isOpenConfirmDialog, openConfirmDialog, closeConfirmDialog] = useFlag()
	useFlag()

	const t = useTranslations()

	useEffect(() => {
		if (alt) {
			setContent(getFirstLetters(alt))
		} else {
			setContent(getFirstLetters('Користувач'))
		}
		setBgColor(getAvatarColor(content as string))
	}, [alt, content])

	const validateFile = (file: File): string | null => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
		const maxSize = 5 * 1024 * 1024 // 5MB

		if (!allowedTypes.includes(file.type)) {
			return t('errors.fileType')
		}

		if (file.size > maxSize) {
			return t('Error.file_size')
		}

		return null
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) {
			return
		}

		const error = validateFile(file)
		if (error) {
			toast.error(error)
			return
		}

		const imageUrl = URL.createObjectURL(file)
		setSelectedImageUrl(imageUrl)
		setShowCropModal(true)

		e.target.value = ''
	}

	const handleCropComplete = async (croppedBlob: Blob) => {
		try {
			const croppedFile = new File([croppedBlob], 'avatar.jpg', {
				type: 'image/jpeg',
				lastModified: Date.now(),
			})

			await onUpload?.(croppedFile)
			toast.success(t('Success.upload'))
			setShowCropModal(false)

			URL.revokeObjectURL(selectedImageUrl)
			setSelectedImageUrl('')
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('errors.upload'))
		}
	}

	const handleCropCancel = () => {
		setShowCropModal(false)
		URL.revokeObjectURL(selectedImageUrl)
		setSelectedImageUrl('')
	}

	const handleUploadClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		fileInputRef.current?.click()
	}

	const handleAvatarClick = () => {
		if (onClick) {
			onClick()
		}
	}

	const handleConfirm = useCallback(() => {
		closeConfirmDialog()
		fileInputRef.current?.click()
	}, [closeConfirmDialog])

	const fullClassName = cn(
		className,
		'relative rounded-full bg-primary-gradient flex items-center justify-center text-white font-medium cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out',
		{
			'w-8 h-8': size === 'sm',
			'w-11 h-11 text-lg': size === 'md',
			'w-[5rem] h-[5rem] text-3xl': size === 'lg',
		}
	)
	return (
		<div
			className={fullClassName}
			style={
				!src
					? { background: `linear-gradient(#fff -125%, ${bgColor} 100%)` }
					: { background: 'transparent' }
			}
			onClick={handleAvatarClick}
		>
			<input
				ref={fileInputRef}
				type='file'
				accept='image/jpeg,image/png,image/webp'
				onChange={handleFileSelect}
				style={{ display: 'none' }}
			/>
			{src ? (
				<Image
					src={src}
					alt={alt || ''}
					width={size === 'lg' ? 200 : 100}
					height={size === 'lg' ? 200 : 100}
				/>
			) : (
				content
			)}

			{src ? (
				<div
					className={`absolute bottom-0 right-0 hover:scale-110 transition-all duration-300 ease-in-out ${
						size === 'lg' ? 'text-xl' : 'text-sm'
					}`}
					onClick={openConfirmDialog}
					title='Змінити фото'
				>
					🔄
				</div>
			) : (
				<div
					className={`absolute bottom-0 right-0 hover:scale-110 transition-all duration-300 ease-in-out ${
						size === 'lg' ? 'text-2xl' : 'text-sm'
					}`}
					onClick={handleUploadClick}
					title='Додати фото'
				>
					📷
				</div>
			)}

			{showCropModal && (
				<ImageCropModal
					isOpen={showCropModal}
					imageUrl={selectedImageUrl}
					onCrop={handleCropComplete}
					onClose={handleCropCancel}
					cropSize={size === 'lg' ? 300 : 200}
				/>
			)}
			<ConfirmDialog
				title='Змінити фото'
				text='Ви впевнені, що хочете змінити фото?'
				isOpen={isOpenConfirmDialog}
				onClose={closeConfirmDialog}
				onConfirm={handleConfirm}
				onDestroy={onRemove}
				onCancel={closeConfirmDialog}
				destroyText='❌ Видалити'
				confirmText='🔄 Змінити'
			/>
		</div>
	)
}

export default AvatarEditable

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { getAvatarColor, getFirstLetters } from '@/utils/textFormat'
import { ImageCropper } from './ImageCropper'
import Image from 'next/image'
import ConfirmDialog from '../modals/ConfirmDialog'
import useFlag from '@/hooks/useFlag'
import { validateFile } from '@/lib/validate'
import { CameraIcon, RefreshCwIcon } from 'lucide-react'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	src?: string
	alt?: string
	isExecutor?: boolean
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
	isExecutor = false,
}: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [content, setContent] = useState('')
	const [bgColor, setBgColor] = useState('')
	const [isCropping, setIsCropping] = useState(false)
	const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
	const [isOpenConfirmDialog, openConfirmDialog, closeConfirmDialog] = useFlag()

	const t = useTranslations()

	useEffect(() => {
		if (alt) {
			setContent(getFirstLetters(alt))
		} else {
			setContent(getFirstLetters('Користувач'))
		}
		setBgColor(getAvatarColor(content as string))
	}, [alt, content])

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
		setIsCropping(true)

		e.target.value = ''
	}

	const handleCropComplete = async (croppedFile: File) => {
		try {
			await onUpload?.(croppedFile)
			toast.success(t('Success.upload'))
			setIsCropping(false)

			if (selectedImageUrl) {
				URL.revokeObjectURL(selectedImageUrl)
				setSelectedImageUrl('')
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t('errors.upload'))
		}
	}

	const handleCropCancel = () => {
		setIsCropping(false)
		if (selectedImageUrl) {
			URL.revokeObjectURL(selectedImageUrl)
			setSelectedImageUrl('')
		}
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

	const handleConfirm = () => {
		closeConfirmDialog()
		fileInputRef.current?.click()
	}

	const fullClassName = cn(
		className,
		'relative bg-primary-gradient flex items-center justify-center text-white cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out',
		isExecutor ? 'rounded-lg' : 'rounded-full',
		{
			'w-8 h-8': size === 'sm',
			'w-11 h-11': size === 'md',
			'w-[5rem] h-[5rem]': size === 'lg',
		}
	)

	const iconClassName = cn(
		'bg-accent p-1 rounded-full absolute hover:scale-110 transition-all duration-300 ease-in-out',
		isExecutor ? 'bottom-[-1px] right-[-1px]' : 'bottom-0 right-0',
		{
			'text-2xl': size === 'lg',
			'text-sm': size === 'md',
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
					className={cn(
						'w-full h-full object-cover',
						isExecutor ? 'rounded-lg' : 'rounded-full'
					)}
				/>
			) : (
				<span
					className={`${
						size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-sm'
					} font-medium`}
				>
					{content}
				</span>
			)}

			{src ? (
				<div
					className={iconClassName}
					onClick={openConfirmDialog}
					title='Змінити фото'
				>
					<RefreshCwIcon size={20} />
				</div>
			) : (
				<div
					className={iconClassName}
					onClick={handleUploadClick}
					title='Додати фото'
				>
					<CameraIcon size={20} />
				</div>
			)}

			{isCropping && selectedImageUrl && (
				<ImageCropper
					src={selectedImageUrl}
					aspectRatio={1}
					onCropComplete={handleCropComplete}
					onCancel={handleCropCancel}
				/>
			)}
			<ConfirmDialog
				title='Змінити фото'
				text={t('Profile.changePhotoText')}
				isOpen={isOpenConfirmDialog}
				onClose={closeConfirmDialog}
				onConfirm={handleConfirm}
				onDestroy={onRemove}
				onCancel={closeConfirmDialog}
				destroyText={t('delete')}
				confirmText={t('change')}
			/>
		</div>
	)
}

export default AvatarEditable

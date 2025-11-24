import { ReactNode, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { getAvatarColor, getFirstLetters } from '@/utils/textFormat'
import { Executor } from '@/types/auth'
import Image from 'next/image'
import { ProviderType } from '@prisma/client'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	provider: Executor
	onClick?: () => void
	icon?: ReactNode
}

const AvatarCompany = ({
	className,
	size = 'md',
	onClick,
	icon,
	provider,
}: Props) => {
	const [content, setContent] = useState('')
	const [bgColor, setBgColor] = useState('')

	const { businessName, type, avatar, companyInfo } = provider

	useEffect(() => {
		let initials = getFirstLetters('Виконавець')

		if (businessName) {
			initials = getFirstLetters(businessName)
		}

		setContent(initials)
		setBgColor(getAvatarColor(initials))
	}, [businessName])

	const fullClassName = cn(
		className,
		'relative rounded-full bg-primary-gradient flex items-center justify-center text-white font-medium cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out',
		type === ProviderType.COMPANY ? 'rounded-lg' : 'rounded-full',
		{
			'w-8 h-8': size === 'sm',
			'w-11 h-11 text-lg': size === 'md',
			'w-[5rem] h-[5rem] text-3xl': size === 'lg',
		}
	)
	const imageSrc = avatar ?? undefined

	return (
		<div
			className='flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-all duration-300 ease-in-out'
			onClick={onClick}
		>
			<div
				className={fullClassName}
				style={{ background: `linear-gradient(#fff -125%, ${bgColor} 100%)` }}
				onClick={onClick}
			>
				{imageSrc ? (
					<Image
						src={imageSrc}
						alt={content}
						width={size === 'lg' ? 200 : 100}
						height={size === 'lg' ? 200 : 100}
					/>
				) : (
					content
				)}
				{icon && (
					<div
						className={`absolute bottom-0 right-0 hover:scale-110 transition-all duration-300 ease-in-out ${
							size === 'lg' ? 'text-2xl' : 'text-sm'
						}`}
						title='Змінити фото'
					>
						{icon}
					</div>
				)}
			</div>
			<div className='px-1'>
				<div className='text-sm font-semibold'>{businessName}</div>
				<div className='text-xs text-primary font-medium'>
					{type === ProviderType.COMPANY
						? companyInfo?.legalForm ?? 'Компанія'
						: 'Виконавець'}
				</div>
			</div>
		</div>
	)
}

export default AvatarCompany

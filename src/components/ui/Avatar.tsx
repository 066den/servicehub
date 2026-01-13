import { ReactNode, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import {
	getAvatarColor,
	getFirstLetters,
	getDisplayName,
} from '@/utils/textFormat'
import { UserProfile } from '@/types/auth'
import { StaffMember } from '@/types'
import Image from 'next/image'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	user?: UserProfile | StaffMember | null
	onClick?: () => void
	icon?: ReactNode
}

const Avatar = ({ className, size = 'md', onClick, icon, user }: Props) => {
	const [content, setContent] = useState('')
	const [bgColor, setBgColor] = useState('')

	useEffect(() => {
		let initials = getFirstLetters('Користувач')

		if (user) {
			initials = getFirstLetters(getDisplayName(user))
		}

		setContent(initials)
		setBgColor(getAvatarColor(initials))
	}, [user])

	const fullClassName = cn(
		className,
		'relative rounded-full bg-primary-gradient flex items-center justify-center text-white font-medium cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out',

		{
			'w-8 h-8': size === 'sm',
			'w-11 h-11 text-lg': size === 'md',
			'w-[5rem] h-[5rem] text-3xl': size === 'lg',
		}
	)
	const imageSrc = user && 'avatar' in user ? user.avatar ?? null : null

	return (
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
	)
}

export default Avatar

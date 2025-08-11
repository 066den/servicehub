import { ReactNode } from 'react'

import classNames from 'classnames'
import { useAuthStore } from '@/stores/authStore'
import { getAvatarColor, getFirstLetters } from '@/utils/textFormat'

import './Avatar.scss'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	onClick?: () => void
	icon?: ReactNode
}

export const Avatar = ({ className, size = 'md', onClick, icon }: Props) => {
	const { user } = useAuthStore()
	let content: ReactNode
	if (user?.displayName) {
		content = getFirstLetters(user?.displayName || '')
	} else {
		content = getFirstLetters(user?.phone || '')
	}

	const bgColor = getAvatarColor(content as string)

	const fullClassName = classNames('user-avatar', `size-${size}`, className)
	return (
		<div
			className={fullClassName}
			style={{ background: `linear-gradient(#fff -125%, ${bgColor} 100%)` }}
			onClick={onClick}
		>
			{content}
			{icon && (
				<div className='avatar-icon' title='Змінити фото'>
					{icon}
				</div>
			)}
		</div>
	)
}

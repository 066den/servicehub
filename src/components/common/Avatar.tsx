import { ReactNode } from 'react'

import classNames from 'classnames'
import { useAuthStore } from '@/stores/authStore'
import { getFirstLetters } from '@/utils/textFormat'

import './Avatar.scss'

type Props = {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	onClick?: () => void
}

export const Avatar = ({ className, size = 'md', onClick }: Props) => {
	const { user } = useAuthStore()
	let content: ReactNode
	if (user?.displayName) {
		content = getFirstLetters(user?.displayName || '')
	} else {
		content = getFirstLetters(user?.phone || '')
	}

	const fullClassName = classNames('user-avatar', `size-${size}`, className)
	return (
		<div className={fullClassName} onClick={onClick}>
			{content}
		</div>
	)
}

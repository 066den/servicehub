'use client'

import React, {
	ReactNode,
	RefObject,
	useCallback,
	useRef,
	useState,
} from 'react'

import classNames from 'classnames'

const CLICK_DURATION = 400

type OwnProps = {
	elRef?: RefObject<HTMLButtonElement>
	type?: 'button' | 'submit' | 'reset'
	size?: 'sm' | 'md' | 'lg'
	color?:
		| 'primary'
		| 'secondary'
		| 'accent'
		| 'danger'
		| 'success'
		| 'warning'
		| 'info'
		| 'light'
		| 'dark'
		| 'link'
	outline?: boolean
	fullWidth?: boolean
	href?: string
	isLink?: boolean
	isText?: boolean
	disabled?: boolean
	className?: string
	allowDisabledClick?: boolean
	shouldStopPropagation?: boolean
	withoutTransform?: boolean
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void

	children: ReactNode
}

const Button = ({
	children,
	type = 'button',
	className,
	size,
	color = 'primary',
	outline,
	fullWidth,
	disabled,
	isLink,
	isText,
	allowDisabledClick,
	shouldStopPropagation,
	withoutTransform,
	onClick,
	elRef,
}: OwnProps) => {
	let elementRef = useRef<HTMLButtonElement>(null)
	if (elRef) {
		elementRef = elRef
	}

	const [isClicked, setIsClicked] = useState(false)

	const fullClassName = classNames('Button', className, size, color, {
		disabled,
		clicked: isClicked,
		outline,
		'not-transformable': withoutTransform,
		'full-width': fullWidth,
		'is-link': isLink,
		'is-text': isText,
	})

	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			if ((allowDisabledClick || !disabled) && onClick) {
				onClick(event)
			}
			if (shouldStopPropagation) {
				event.stopPropagation()
			}

			setIsClicked(true)
			setTimeout(() => {
				setIsClicked(false)
			}, CLICK_DURATION)
		},
		[allowDisabledClick, disabled, onClick, shouldStopPropagation]
	)

	return (
		<button
			className={fullClassName}
			ref={elementRef}
			type={type}
			disabled={disabled}
			onClick={handleClick}
		>
			{children}
		</button>
	)
}

export default Button

'use client'

import React, { ReactNode, RefObject, useCallback, useRef } from 'react'

import classNames from 'classnames'
import LoadingSpinner from './LoadingSpinner'

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
		| 'outline-white'
		| 'white'
		| 'translucent'
	round?: boolean
	outline?: boolean
	fullWidth?: boolean
	href?: string
	isLink?: boolean
	isText?: boolean
	loading?: boolean
	disabled?: boolean
	className?: string
	ariaLabel?: string
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
	color,
	outline,
	fullWidth,
	disabled,
	loading,
	isLink,
	isText,
	round,
	allowDisabledClick,
	shouldStopPropagation,
	withoutTransform,
	onClick,
	elRef,
	ariaLabel,
}: OwnProps) => {
	let elementRef = useRef<HTMLButtonElement>(null)
	if (elRef) {
		elementRef = elRef
	}

	const fullClassName = classNames('Button', className, size, color, {
		disabled,
		outline,
		loading,
		round,
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
		},
		[allowDisabledClick, disabled, onClick, shouldStopPropagation]
	)

	return (
		<button
			className={fullClassName}
			ref={elementRef}
			type={type}
			disabled={disabled || loading}
			onClick={handleClick}
			aria-label={ariaLabel}
		>
			{children}
			{loading && <LoadingSpinner />}
		</button>
	)
}

export default Button

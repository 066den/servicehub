'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface InputProps extends React.ComponentProps<'input'> {
	label?: string
	placeholder?: string
	required?: boolean
	className?: string
	containerClassName?: string
	errorMessage?: string
	withClear?: boolean
	helperText?: string
	disabled?: boolean
	type?: string
	error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			containerClassName,
			type = 'text',
			label,
			placeholder,
			required,
			errorMessage,
			withClear,
			helperText,
			disabled,
			error,
			id,
			...props
		},
		ref
	) => {
		const generatedId = React.useId()
		const sanitizedGeneratedId = React.useMemo(
			() => generatedId.replace(/[^a-zA-Z0-9_-]/g, ''),
			[generatedId]
		)
		const inputId = id ?? `input-${sanitizedGeneratedId || 'field'}`

		return (
			<div className={cn('space-y-2 mb-4', containerClassName)}>
				{label && (
					<Label htmlFor={inputId} required={required}>
						{label}
					</Label>
				)}
				<input
					ref={ref}
					id={inputId}
					type={type}
					data-slot='input'
					placeholder={placeholder}
					disabled={disabled}
					className={cn(
						'flex h-13 w-full rounded-lg border-2 border-gray-200 bg-input px-4 py-3 text-base font-normal text-gray-900 placeholder:text-gray-500 transition-all duration-300 ease',
						'focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100',
						'hover:border-gray-300',
						'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
						'file:border-0 file:bg-transparent file:text-sm file:font-medium',
						(error || errorMessage) &&
							'border-red-500 focus:border-red-500 focus:ring-red-100 bg-destructive-light',
						withClear && 'pr-10',
						className
					)}
					{...props}
				/>
				{(error || errorMessage) && (
					<div className='text-destructive text-sm'>{errorMessage}</div>
				)}
				{helperText && !error && !errorMessage && (
					<div className='text-gray-500 text-sm'>{helperText}</div>
				)}
			</div>
		)
	}
)

Input.displayName = 'Input'

export { Input }


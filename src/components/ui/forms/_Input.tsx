import { useEffect, useState } from 'react'

import { FieldProps } from 'formik'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { shakeVariants } from '../animate/variants'

type OwnProps = {
	label?: string
	placeholder?: string
	required?: boolean
	className?: string
	errorMessage?: string
	wwithClear?: boolean
	helperText?: string
	disabled?: boolean
	type?: string
}

const Input = ({
	label,
	field,
	form: { errors, setFieldValue },
	className,
	errorMessage,
	placeholder,
	wwithClear,
	helperText,
	disabled,
	required,
	type,
}: OwnProps & FieldProps) => {
	const { name, onBlur } = field

	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFieldValue(name, e.target.value)
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		onBlur(e)
	}

	const extractFieldError = (value: unknown): string | null => {
		if (typeof value === 'string') {
			return value
		}

		if (Array.isArray(value)) {
			const stringError = value.find(
				(item): item is string => typeof item === 'string'
			)
			return stringError ?? null
		}

		return null
	}

	useEffect(() => {
		if (typeof errorMessage === 'string') {
			setError(errorMessage)
			return
		}

		const fieldError = (errors as Record<string, unknown>)?.[name]
		setError(extractFieldError(fieldError))
	}, [errors, errorMessage, name])

	return (
		<div
			className={cn(
				'position-relative mb',
				className,
				wwithClear && 'with-clear'
			)}
		>
			{label && (
				<label
					className={cn('form-label', required && 'required')}
					htmlFor={name}
				>
					{label}
				</label>
			)}
			<motion.input
				variants={shakeVariants}
				animate={error ? 'medium' : 'static'}
				{...field}
				placeholder={placeholder}
				onChange={handleChange}
				onBlur={handleBlur}
				className='form-input'
				disabled={disabled}
				type={type}
			/>

			{error && <div className='form-input-error'>{error}</div>}
			{helperText && !error && (
				<div className='form-input-helper'>{helperText}</div>
			)}
		</div>
	)
}

export default Input

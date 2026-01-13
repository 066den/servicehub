'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { shakeVariants } from '../animate/variants'

type TextareaProps = {
	label?: string
	placeholder?: string
	required?: boolean
	helperText?: string
	className?: string
	disabled?: boolean
	rows?: number
	maxLength?: number
	field?: {
		name: string
		value: string
		onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
		onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void
	}
	form?: {
		errors: { [key: string]: string }
		touched: { [key: string]: boolean }
		setFieldValue: (field: string, value: unknown) => void
		setFieldTouched: (field: string, touched?: boolean) => void
	}

	name?: string
	value?: string

	onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
	error?: string
	touched?: boolean
}

const Textarea = ({
	field,
	form,
	name,
	value,
	label,
	placeholder,
	required,
	helperText,
	className,
	disabled,
	rows = 4,
	maxLength,
	onChange,
	onBlur,
	error,
	touched,
}: TextareaProps) => {
	const isFormikField = !!(field && form)

	const fieldName = field?.name || name || ''
	const fieldValue = field?.value || value || ''
	const fieldError = form?.errors[fieldName] || error
	const fieldTouched = form?.touched[fieldName] || touched
	const hasError = fieldTouched && fieldError

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (isFormikField && field) {
			field.onChange(e)
		} else if (onChange) {
			onChange(e)
		}
	}

	const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
		if (isFormikField && field) {
			field.onBlur(e)
		} else if (onBlur) {
			onBlur(e)
		}
	}

	const currentLength = fieldValue.length
	const showCounter = maxLength && maxLength > 0

	return (
		<div className={cn('form-group', className)}>
			{label && (
				<label
					htmlFor={fieldName}
					className={cn('form-label', required && 'required')}
				>
					{label}
				</label>
			)}
			<motion.div
				variants={shakeVariants}
				animate={error ? 'medium' : 'static'}
				className='form-input-container'
			>
				<textarea
					id={fieldName}
					className={cn('form-input form-textarea', hasError && 'is-invalid')}
					name={fieldName}
					value={fieldValue}
					onChange={handleChange}
					onBlur={handleBlur}
					disabled={disabled}
					placeholder={placeholder}
					rows={rows}
					maxLength={maxLength}
				/>
				{showCounter && (
					<div
						className={`character-counter ${
							currentLength > maxLength * 0.9 ? 'warning' : ''
						} ${currentLength >= maxLength ? 'limit' : ''}`}
					>
						{currentLength}
						{maxLength && `/${maxLength}`}
					</div>
				)}
			</motion.div>

			{error && <div className='form-input-error'>{error}</div>}
			{helperText && !error && (
				<div className='form-input-helper'>{helperText}</div>
			)}
		</div>
	)
}

export default Textarea

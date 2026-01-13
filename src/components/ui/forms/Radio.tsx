'use client'
import { FieldProps } from 'formik'
import { cn } from '@/lib/utils'

type RadioProps = {
	label: string
	className?: string
	name: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	field?: {
		name: string
		value: string
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
		onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	}
	form?: {
		errors: Record<string, string>
		touched: Record<string, boolean>
		setFieldValue: (
			field: string,
			value: unknown,
			shouldValidate?: boolean
		) => void
		setFieldTouched: (
			field: string,
			isTouched?: boolean,
			shouldValidate?: boolean
		) => void
	}
	error?: string
	touched?: boolean
}

const Radio = ({
	field,
	form,
	label,
	className,
	name,
	value,
	error,
	touched,
	onChange,
	onBlur,
}: RadioProps & FieldProps) => {
	const isFormikField = !!(field && form)

	const fieldName = field?.name || name || ''
	const fieldValue = field?.value || value || ''
	const fieldError = form?.errors[fieldName] || error
	const fieldTouched = form?.touched[fieldName] || touched
	const hasError = fieldTouched && fieldError

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isFormikField && form) {
			form.setFieldValue(fieldName, e.target.value)
		} else if (onChange) {
			onChange(e)
		}
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (isFormikField && form) {
			form.setFieldTouched(fieldName, true)
		} else if (onBlur) {
			onBlur(e)
		}
	}

	return (
		<label className={cn('radio-item', className, hasError && 'error')}>
			<input
				type='radio'
				name={fieldName}
				checked={fieldValue === value}
				value={value}
				onChange={handleChange}
				onBlur={handleBlur}
				className='form-radio'
			/>
			{label && <span>{label}</span>}
		</label>
	)
}

export default Radio

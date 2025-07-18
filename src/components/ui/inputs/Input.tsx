import { useEffect, useRef, useState } from 'react'

import { FieldProps } from 'formik'
import classNames from 'classnames'

type OwnProps = {
	label?: string
	placeholder?: string
	required?: boolean
	className?: string
	errorMessage?: string
}

const Input = ({
	label,
	field,
	form: { errors, setFieldValue },
	className,
	errorMessage,
	placeholder,
}: OwnProps & FieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null)

	const { name, onBlur } = field

	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFieldValue(name, e.target.value)
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		onBlur(e)
	}

	useEffect(() => {
		setError(
			errorMessage || (typeof errors[name] === 'string' ? errors[name] : '')
		)
	}, [errors, errorMessage, name])

	return (
		<div className='form-group'>
			{label && (
				<label className='form-label' htmlFor='profile-name'>
					{label}
				</label>
			)}
			<input
				ref={inputRef}
				{...field}
				placeholder={placeholder}
				onChange={handleChange}
				onBlur={handleBlur}
				className={classNames('form-input', className)}
			/>
			{error && (
				<div className='error-message' id={`${name}Error`}>
					{error}
				</div>
			)}
		</div>
	)
}

export default Input

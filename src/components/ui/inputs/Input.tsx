import { useEffect, useRef, useState } from 'react'

import { FieldProps } from 'formik'
import classNames from 'classnames'
import { motion, Variants } from 'motion/react'
import { shakeVariants } from '../animate/variants'

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
		<div className={classNames('form-group', className)}>
			{label && (
				<label className='form-label' htmlFor={name}>
					{label}
				</label>
			)}
			<motion.input
				variants={shakeVariants as Variants}
				animate={error ? 'medium' : 'static'}
				ref={inputRef}
				{...field}
				placeholder={placeholder}
				onChange={handleChange}
				onBlur={handleBlur}
				className='form-input'
			/>
			{error && (
				<div className='form-input-error' id={`${name}Error`}>
					{error}
				</div>
			)}
		</div>
	)
}

export default Input

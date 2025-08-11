import { useEffect, useState } from 'react'
import { FieldProps } from 'formik'
import { formatPhone } from '@/utils/phoneNumber'

const PHONE_LENGTH = 10

type InputPhoneProps = {
	label: string
} & FieldProps

const InputPhone = ({
	label,
	field,
	form: { setFieldValue },
}: InputPhoneProps) => {
	const [customValue, setCustomValue] = useState('')

	useEffect(() => {
		if (field.value) {
			const formatted = formatPhone(field.value)
			setCustomValue(formatted)
		} else {
			setCustomValue('')
		}
	}, [field.value])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, '')
		const formatted = formatPhone(rawValue)

		setCustomValue(formatted)
		setFieldValue(field.name, rawValue.slice(0, PHONE_LENGTH))
	}

	return (
		<div className='form-group'>
			{label && (
				<label htmlFor='phone-number' className='form-label required'>
					{label}
				</label>
			)}
			<div className='phone-input-container'>
				<div className='country-code'>
					<div className='flag' />
					+38
				</div>
				<input
					{...field}
					type='tel'
					value={customValue}
					id={field.name + '_input'}
					className='form-input'
					placeholder='050 123 45 67'
					autoComplete='off'
					onChange={handleChange}
				/>
			</div>
		</div>
	)
}

export default InputPhone

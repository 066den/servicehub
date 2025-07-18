import { useState } from 'react'
import { FieldProps } from 'formik'

const PHONE_LENGTH = 10

type OwnProps = {
	label: string
}

const InputPhone = ({
	label,
	field,
	form: { setFieldValue },
}: OwnProps & FieldProps) => {
	const [customValue, setCustomValue] = useState('')
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/\D/g, '')

		if (value.length > PHONE_LENGTH) {
			value = value.substring(0, PHONE_LENGTH)
		}

		if (value.length <= 3) {
			value = value
		} else if (value.length <= 6) {
			value = `${value.slice(0, 3)} ${value.slice(3)}`
		} else if (value.length <= 8) {
			value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
		} else {
			value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(
				6,
				8
			)} ${value.slice(8)}`
		}

		setFieldValue(field.name, value.replace(/\s+/g, ''))
		setCustomValue(value)
	}
	return (
		<div className='form-group'>
			{label && (
				<label htmlFor='phone-number' className='form-label'>
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
					maxLength={13}
					onChange={onChange}
				/>
			</div>
		</div>
	)
}

export default InputPhone

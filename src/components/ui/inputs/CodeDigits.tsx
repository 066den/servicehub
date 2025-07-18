import useEffectOnce from '@/hooks/useEffectOnce'
import { FieldProps } from 'formik'
import { useRef, useState } from 'react'

const CODE_DIGITS = 4

const CodeDigits = ({ field, form: { setFieldValue } }: FieldProps) => {
	const { name } = field
	const [code, setCode] = useState(new Array(CODE_DIGITS).fill(''))
	const inputs = useRef<HTMLInputElement[] | null>([])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		const value = e.target.value.replace(/\D/g, '')
		const newCode = [...code]
		newCode[index] = value
		setCode(newCode)

		if (
			value &&
			index < CODE_DIGITS - 1 &&
			inputs.current &&
			inputs.current[index + 1]
		) {
			inputs.current[index + 1].focus()
		}

		setFieldValue(name, newCode.join(''))

		// if (newCode.every(digit => digit !== '')) {
		// 	setTimeout(() => {
		// 		onSubmit(newCode.join(''))
		// 	}, 300)
		// }
	}

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => {
		if (
			e.key === 'Backspace' &&
			!code[index] &&
			index > 0 &&
			inputs.current &&
			inputs.current[index - 1]
		) {
			inputs.current[index - 1].focus()
			const newCode = [...code]
			newCode[index - 1] = ''
			setCode(newCode)
			setFieldValue(name, newCode.join(''))
			e.preventDefault()
		}
		if (
			!/[0-9]/.test(e.key) &&
			!['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
		) {
			e.preventDefault()
		}
	}

	const handlePaste = (
		e: React.ClipboardEvent<HTMLInputElement>,
		index: number
	) => {
		e.preventDefault()
		const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
		if (pastedData.length === CODE_DIGITS) {
			const newCode = pastedData.split('')
			setCode(newCode)

			if (inputs.current && inputs.current[pastedData.length - 1]) {
				inputs.current[pastedData.length - 1].focus()
			}
			setFieldValue(name, newCode.join(''))
		} else {
			const pasteChar = pastedData.slice(0, 1)
			const newCode = [...code]
			newCode[index] = pasteChar
			setCode(newCode)

			if (
				pasteChar &&
				index < CODE_DIGITS - 1 &&
				inputs.current &&
				inputs.current[index + 1]
			) {
				inputs.current[index + 1].focus()
			}
		}
	}

	useEffectOnce(() => {
		if (inputs.current && inputs.current[0]) {
			inputs.current[0].focus()
		}
	})

	return (
		<div className='sms-code-container'>
			{code.map((digit, index) => (
				<input
					key={index}
					type='text'
					inputMode='numeric'
					className={`code-digit ${digit ? 'filled' : ''}`}
					maxLength={1}
					required
					value={digit}
					onChange={e => handleChange(e, index)}
					onKeyDown={e => handleKeyDown(e, index)}
					onPaste={e => handlePaste(e, index)}
					ref={el => {
						if (inputs.current) {
							inputs.current[index] = el as HTMLInputElement
						}
					}}
				/>
			))}
		</div>
	)
}

export default CodeDigits

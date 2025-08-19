import { useRef, useState, useEffect } from 'react'
import { Input } from '../input'

const CODE_DIGITS = 4

type CodeDigitsProps = {
	value?: string
	onChange: (value: string) => void
	error?: string
}

const CodeDigits = ({ value = '', onChange, error }: CodeDigitsProps) => {
	const [code, setCode] = useState<string[]>(() => {
		// Initialize with value if provided, otherwise empty array
		if (value && value.length === CODE_DIGITS) {
			return value.split('')
		}
		return new Array(CODE_DIGITS).fill('')
	})
	const inputs = useRef<HTMLInputElement[]>([])

	// Предотвращаем сброс состояния при изменении value
	useEffect(() => {
		if (value === '') {
			setCode(new Array(CODE_DIGITS).fill(''))
		}
	}, [value])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		const inputValue = e.target.value.replace(/\D/g, '')
		const newCode = [...code]
		newCode[index] = inputValue

		// Обновляем внутреннее состояние
		setCode(newCode)

		// Автофокус на следующий input
		if (inputValue && index < CODE_DIGITS - 1 && inputs.current[index + 1]) {
			inputs.current[index + 1].focus()
		}

		// Вызываем внешний onChange
		onChange(newCode.join(''))
	}

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => {
		// Обработка Backspace
		if (
			e.key === 'Backspace' &&
			!code[index] &&
			index > 0 &&
			inputs.current[index - 1]
		) {
			inputs.current[index - 1].focus()
			const newCode = [...code]
			newCode[index - 1] = ''
			setCode(newCode)
			onChange(newCode.join(''))
			e.preventDefault()
		}

		// Разрешаем только цифры и служебные клавиши
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
			// Вставляем весь код
			const newCode = pastedData.split('')
			setCode(newCode)
			onChange(newCode.join(''))

			// Фокус на последний input
			if (inputs.current[CODE_DIGITS - 1]) {
				inputs.current[CODE_DIGITS - 1].focus()
			}
		} else if (pastedData.length > 0) {
			// Вставляем одну цифру
			const newCode = [...code]
			newCode[index] = pastedData[0]
			setCode(newCode)
			onChange(newCode.join(''))

			// Фокус на следующий input если есть значение
			if (
				pastedData[0] &&
				index < CODE_DIGITS - 1 &&
				inputs.current[index + 1]
			) {
				inputs.current[index + 1].focus()
			}
		}
	}

	// Автофокус на первый input при монтировании
	useEffect(() => {
		if (inputs.current[0]) {
			inputs.current[0].focus()
		}
	}, [])

	return (
		<div className='flex gap-2 justify-center'>
			{Array.from({ length: CODE_DIGITS }).map((_, index) => (
				<Input
					key={index}
					ref={el => {
						if (el) inputs.current[index] = el
					}}
					id={`code-${index}`}
					type='text'
					maxLength={1}
					className={`w-12 h-14 text-center text-lg font-mono ${
						error ? 'border-destructive' : ''
					}`}
					value={code[index] || ''}
					onChange={e => handleChange(e, index)}
					onKeyDown={e => handleKeyDown(e, index)}
					onPaste={e => handlePaste(e, index)}
					autoComplete='one-time-code'
				/>
			))}
		</div>
	)
}

export default CodeDigits

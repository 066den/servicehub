import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

interface SelectOption {
	value: string
	label: string
	disabled?: boolean
	icon?: string
}

interface SelectProps {
	field?: {
		name: string
		value: string
		onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
		onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void
	}
	form?: {
		errors: { [key: string]: string }
		touched: { [key: string]: boolean }
		setFieldValue: (field: string, value: unknown) => void
		setFieldTouched: (field: string, touched?: boolean) => void
	}

	name?: string
	value?: string

	options: SelectOption[]
	label?: string
	placeholder?: string
	required?: boolean
	helpText?: string
	className?: string
	disabled?: boolean
	searchable?: boolean
	clearable?: boolean
	multiple?: boolean

	onChange?: (value: string | string[]) => void
	onBlur?: () => void
	error?: string
	touched?: boolean
}

const Select = ({
	field,
	form,
	name,
	value,
	options,
	label,
	placeholder = 'Оберіть варіант...',
	required = false,
	helpText,
	className = '',
	disabled = false,
	searchable = false,
	clearable = false,
	multiple = false,
	onChange,
	onBlur,
	error,
	touched,
}: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const isFormikField = !!(field && form)

	const fieldName = field?.name || name || ''
	const fieldValue = field?.value || value || (multiple ? [] : '')
	const fieldError = form?.errors[fieldName] || error
	const fieldTouched = form?.touched[fieldName] || touched
	const hasError = fieldTouched && fieldError

	const filteredOptions = searchable
		? options.filter(option =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: options

	const multipleValues: string[] =
		multiple && Array.isArray(fieldValue) ? fieldValue : []

	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [isOpen, searchable])

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen)
			setHighlightedIndex(-1)
		}
	}

	const handleOptionClick = (optionValue: string) => {
		if (multiple) {
			const currentValues: string[] = Array.isArray(fieldValue)
				? (fieldValue as string[])
				: []
			const newValues = currentValues.includes(optionValue)
				? currentValues.filter((v: string) => v !== optionValue)
				: [...currentValues, optionValue]

			if (isFormikField && form) {
				form.setFieldValue(fieldName, newValues)
			} else if (onChange) {
				onChange(newValues)
			}
		} else {
			if (isFormikField && form) {
				form.setFieldValue(fieldName, optionValue)
			} else if (onChange) {
				onChange(optionValue)
			}
			setIsOpen(false)
		}

		setSearchQuery('')
		setHighlightedIndex(-1)
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		const newValue = multiple ? [] : ''

		if (isFormikField && form) {
			form.setFieldValue(fieldName, newValue)
		} else if (onChange) {
			onChange(newValue)
		}
	}

	const handleBlur = () => {
		if (isFormikField && form) {
			form.setFieldTouched(fieldName, true)
		} else if (onBlur) {
			onBlur()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return

		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault()
				if (!isOpen) {
					setIsOpen(true)
				} else if (
					highlightedIndex >= 0 &&
					highlightedIndex < filteredOptions.length
				) {
					handleOptionClick(filteredOptions[highlightedIndex].value)
				}
				break
			case 'ArrowDown':
				e.preventDefault()
				if (!isOpen) {
					setIsOpen(true)
				} else {
					setHighlightedIndex(prev =>
						prev < filteredOptions.length - 1 ? prev + 1 : 0
					)
				}
				break
			case 'ArrowUp':
				e.preventDefault()
				if (isOpen) {
					setHighlightedIndex(prev =>
						prev > 0 ? prev - 1 : filteredOptions.length - 1
					)
				}
				break
			case 'Escape':
				setIsOpen(false)
				setSearchQuery('')
				setHighlightedIndex(-1)
				break
		}
	}

	const getDisplayText = () => {
		if (multiple && Array.isArray(fieldValue) && fieldValue.length > 0) {
			const selected = options.filter(opt => multipleValues.includes(opt.value))
			if (selected.length === 1) {
				return selected[0].label
			}
			return `Обрано ${selected.length} варіантів`
		} else if (!multiple && fieldValue) {
			const selected = options.find(opt => opt.value === fieldValue)
			return selected ? selected.label : ''
		}
		return ''
	}

	const showClearButton =
		clearable &&
		fieldValue &&
		((multiple && Array.isArray(fieldValue) && fieldValue.length > 0) ||
			(!multiple && fieldValue))

	return (
		<div className={`form-group ${className}`}>
			{label && (
				<label className={classNames('form-label', { required })}>
					{label}
				</label>
			)}

			<div className='form-input-container' ref={dropdownRef}>
				<div
					className={`select-control ${isOpen ? 'open' : ''} ${
						hasError ? 'error' : ''
					} ${disabled ? 'disabled' : ''}`}
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					tabIndex={disabled ? -1 : 0}
					aria-controls={name}
					role='combobox'
					aria-expanded={isOpen}
					aria-haspopup='listbox'
				>
					<div className='select-value'>
						{getDisplayText() || (
							<span className='select-placeholder'>{placeholder}</span>
						)}
					</div>

					<div className='select-indicators'>
						{showClearButton && (
							<button
								type='button'
								className='clear-button'
								onClick={handleClear}
								aria-label='Очистити'
							>
								×
							</button>
						)}
						<div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
					</div>
				</div>

				{isOpen && (
					<div className='select-dropdown'>
						{searchable && (
							<div className='search-wrapper'>
								<input
									ref={searchInputRef}
									type='text'
									className='search-input'
									placeholder='Пошук...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									onClick={e => e.stopPropagation()}
								/>
							</div>
						)}

						<div className='options-list' role='listbox'>
							{filteredOptions.length === 0 ? (
								<div className='no-options'>Немає варіантів</div>
							) : (
								filteredOptions.map((option, index) => {
									const isSelected = multiple
										? multipleValues.includes(option.value)
										: fieldValue === option.value
									const isHighlighted = index === highlightedIndex

									return (
										<div
											key={option.value}
											className={`option ${isSelected ? 'selected' : ''} ${
												isHighlighted ? 'highlighted' : ''
											} ${option.disabled ? 'disabled' : ''}`}
											onClick={() =>
												!option.disabled && handleOptionClick(option.value)
											}
											role='option'
											aria-selected={isSelected}
										>
											{multiple && (
												<div
													className={`checkbox ${isSelected ? 'checked' : ''}`}
												>
													{isSelected && '✓'}
												</div>
											)}
											{option.icon && (
												<span className='option-icon'>{option.icon}</span>
											)}
											<span className='option-label'>{option.label}</span>
										</div>
									)
								})
							)}
						</div>
					</div>
				)}
			</div>

			{helpText && !hasError && <p className='form-input-helper'>{helpText}</p>}

			{hasError && <p className='form-input-error'>{fieldError}</p>}
		</div>
	)
}

export default Select

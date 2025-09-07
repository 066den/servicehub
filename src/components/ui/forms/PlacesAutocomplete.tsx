'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete'

import { PlacesAutocompleteProps, Suggestion } from '@/types'
import { Input } from '../input'
import { Label } from '../label'
import { Button } from '../button'
import LoadingSpinner from '../LoadingSpinner'
import { useGoogleMaps } from '@/components/providers/GoogleMapsProvider'
import { getLocation } from '@/utils/getLocation'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const PlacesAutocomplete = ({
	onLocationSelect,
	location,
	disabled,
	label,
	placeholder,
	helperText,
	types,
	className,
}: PlacesAutocompleteProps) => {
	const t = useTranslations('Form')
	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const { isLoaded } = useGoogleMaps()

	const {
		ready,
		value,
		setValue,
		suggestions: { status, data },
		clearSuggestions,
		init,
	} = usePlacesAutocomplete({
		requestOptions: {
			types: types || ['(cities)'],
			componentRestrictions: { country: 'ua' },
		},
		initOnMount: false,
		debounce: 300,
	})

	const [isLoading, setIsLoading] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	useEffect(() => {
		setHighlightedIndex(-1)
	}, [data])

	useEffect(() => {
		if (isLoaded) {
			init()
		}
	}, [isLoaded, init])

	useEffect(() => {
		if (location && location.city) {
			setValue(`${location?.city}, ${location?.area}`)
			onLocationSelect?.(location)
		}
	}, [location, onLocationSelect, setValue])

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false)
				clearSuggestions()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [clearSuggestions])

	const handleSelect = useCallback(
		(suggestion: Suggestion) => {
			const description = suggestion.description
			setValue(description)
			clearSuggestions()
			setIsDropdownOpen(false)
			setIsLoading(true)

			getGeocode({ address: description, language: 'uk', region: 'ua' })
				.then(results => {
					const result = results[0]
					const { lat, lng } = getLatLng(result)
					const locationData = getLocation(result)
					onLocationSelect?.({
						coordinates: {
							lat,
							lng,
						},
						...locationData,
					})
				})
				.catch(error => {
					console.error('Error getting coordinates:', error)
				})
				.finally(() => {
					setIsLoading(false)
				})
		},
		[clearSuggestions, onLocationSelect, setValue]
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setValue(newValue)
		setIsDropdownOpen(true)
		if (newValue.length === 0) {
			setIsDropdownOpen(false)
			clearSuggestions()
		}
	}

	const handleInputFocus = () => {
		if (value.length > 0 && data.length > 0) {
			setIsDropdownOpen(true)
		}
	}

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!data.length) return

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					setHighlightedIndex(prev => (prev < data.length - 1 ? prev + 1 : 0))
					break
				case 'ArrowUp':
					e.preventDefault()
					setHighlightedIndex(prev => (prev > 0 ? prev - 1 : data.length - 1))
					break
				case 'Enter':
					e.preventDefault()
					if (highlightedIndex >= 0) {
						handleSelect(data[highlightedIndex])
					}
					break
				case 'Escape':
					clearSuggestions()
					setIsDropdownOpen(false)
					setHighlightedIndex(-1)
					break
			}
		},
		[data, highlightedIndex, handleSelect, clearSuggestions]
	)

	const handleClear = () => {
		setValue('')
		clearSuggestions()
		setIsDropdownOpen(false)
		setHighlightedIndex(-1)
	}

	return (
		<div className={cn('space-y-2', className)}>
			{label && <Label htmlFor={inputRef.current?.id}>{label}</Label>}

			<div className='relative' ref={dropdownRef}>
				<Input
					ref={inputRef}
					placeholder={placeholder || t('locationPlaceholder')}
					value={value}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					disabled={!ready || disabled}
					onKeyDown={handleKeyDown}
					withClear
					className='mb-0'
				/>

				{/* Clear button */}
				{value && (
					<Button
						variant='ghost'
						size='round'
						withoutTransform
						onClick={handleClear}
						className='absolute right-1 top-1/2 -translate-y-1/2 p-0'
					>
						<X />
					</Button>
				)}

				{/* Loading indicator */}
				{isLoading && (
					<div className='absolute right-2 top-1/2 -translate-y-1/2'>
						<LoadingSpinner size='sm' color='primary' />
					</div>
				)}

				{/* Dropdown */}
				{isDropdownOpen && status === 'OK' && data.length > 0 && (
					<div className='absolute top-full z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-65 overflow-auto'>
						{data.map((item, index) => (
							<div
								key={item.place_id}
								className={cn(
									'px-4 py-3 cursor-pointer transition-colors',
									'hover:bg-gray-50 focus:bg-gray-50',
									index === highlightedIndex &&
										'bg-blue-50 border-l-2 border-blue-500',
									'first:rounded-t-lg last:rounded-b-lg'
								)}
								onClick={() => handleSelect(item)}
								onMouseEnter={() => setHighlightedIndex(index)}
							>
								<div className='text-gray-900'>{item.description}</div>
							</div>
						))}
					</div>
				)}

				{/* No results */}
				{isDropdownOpen && status === 'ZERO_RESULTS' && (
					<div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg'>
						<div className='px-4 py-3 text-sm text-gray-500 text-center'>
							{t('noResultsFound')}
						</div>
					</div>
				)}
			</div>
			{helperText && <div className='text-sm text-gray-500'>{helperText}</div>}
		</div>
	)
}

export default PlacesAutocomplete

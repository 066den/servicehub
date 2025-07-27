'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Libraries, useJsApiLoader } from '@react-google-maps/api'
import { useTranslations } from 'next-intl'
import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete'
import IconSvg from '../IconSvg'
import Button from '../Button'
import { LocationData, PlacesAutocompleteProps, Suggestion } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY
const libraries: Libraries = ['places']

const PlacesAutocomplete = ({
	onLocationSelect,
	disabled,
}: PlacesAutocompleteProps) => {
	const t = useTranslations('Form')
	const inputRef = useRef<HTMLInputElement>(null)
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: API_KEY || '',
		libraries,
	})

	const {
		ready,
		value,
		setValue,
		suggestions: { status, data },
		clearSuggestions,
		init,
	} = usePlacesAutocomplete({
		requestOptions: {
			types: ['(cities)'],
			componentRestrictions: { country: 'ua' },
		},
		initOnMount: false,
		debounce: 300,
	})

	const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)

	useEffect(() => {
		setHighlightedIndex(-1)
	}, [data])

	useEffect(() => {
		if (isLoaded) {
			init()
		}
	}, [isLoaded, init])

	const handleSelect = useCallback(
		(suggestion: Suggestion) => {
			setValue(suggestion.description)
			clearSuggestions()
			setIsLoading(true)
		},
		[clearSuggestions, setValue]
	)

	const handleClear = useCallback(() => {
		setValue('')
		setSelectedLocation(null)
		clearSuggestions()
		inputRef.current?.focus()
	}, [setValue, clearSuggestions])

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
					setHighlightedIndex(-1)
					break
			}
		},
		[data, highlightedIndex, handleSelect, clearSuggestions]
	)

	return (
		<div className='form-group'>
			<div className='input-container'>
				<input
					type='text'
					className='form-input'
					placeholder={t('locationPlaceholder')}
					value={value}
					onChange={e => setValue(e.target.value)}
					disabled={!ready || disabled}
					onFocus={() => {
						clearSuggestions()
					}}
					onKeyDown={handleKeyDown}
				/>
				<Button
					round
					color='translucent'
					size='sm'
					ariaLabel='Close'
					className='value-clear'
					onClick={handleClear}
				>
					<IconSvg name='close' />
				</Button>
			</div>
			<div className='dropdown-menu'>
				{status === 'OK' &&
					data.map((suggestion, index) => (
						<div
							key={suggestion.place_id}
							onClick={() => handleSelect(suggestion)}
							onMouseEnter={() => setHighlightedIndex(index)}
							className='menu-item'
						>
							{suggestion.description}
						</div>
					))}
			</div>
		</div>
	)
}

export default PlacesAutocomplete

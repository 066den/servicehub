'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete'
import IconSvg from '../IconSvg'
import Button from '../Button'
import { PlacesAutocompleteProps, Suggestion } from '@/types'
import DropdownMenu from '../DropdownMenu'
import { useGoogleMaps } from '@/components/providers/GoogleMapsProvider'
import { getLocation } from '@/utils/getLocation'

const PlacesAutocomplete = ({
	onLocationSelect,
	location,
	disabled,
	label,
	placeholder,
	helperText,
	types,
}: PlacesAutocompleteProps) => {
	const t = useTranslations('Form')
	const inputRef = useRef<HTMLInputElement>(null)
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

	const handleSelect = useCallback(
		(suggestion: Suggestion) => {
			const description = suggestion.description
			setValue(description)
			clearSuggestions()
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

	const handleClear = useCallback(() => {
		setValue('')
		clearSuggestions()
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

	const trigger = (
		<div className='input-container with-clear'>
			<input
				ref={inputRef}
				type='text'
				className='form-input'
				placeholder={placeholder || t('locationPlaceholder')}
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
	)

	const items = data.map(item => ({
		id: item.place_id,
		label: item.description,
	}))

	return (
		<div className='form-group'>
			{label && <label className='form-label'>{label}</label>}
			<DropdownMenu
				className='places-autocomplete'
				triggerOn='focus'
				trigger={trigger}
				items={status === 'OK' ? items : []}
				loading={isLoading}
				emptyText={t('noResultsFound')}
				onItemSelect={item => {
					const selected = data.find(d => d.place_id === item.id)
					if (selected) handleSelect(selected)
				}}
			/>
			{helperText && <div className='form-input-helper'>{helperText}</div>}
		</div>
	)
}

export default PlacesAutocomplete

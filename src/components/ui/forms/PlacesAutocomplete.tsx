'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

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
	required,
	className,
}: PlacesAutocompleteProps) => {
	const t = useTranslations('Form')
	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const { isLoaded } = useGoogleMaps()

	const [value, setValue] = useState('')
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [status, setStatus] = useState<'OK' | 'ZERO_RESULTS' | 'ERROR'>('OK')
	const [isLoading, setIsLoading] = useState(false)
	const [isFetching, setIsFetching] = useState(false)
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [ready, setReady] = useState(false)
	const autocompleteSuggestionClassRef = useRef<
		typeof google.maps.places.AutocompleteSuggestion | null
	>(null)
	const sessionTokenRef =
		useRef<google.maps.places.AutocompleteSessionToken | null>(null)
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	// Инициализация нового Places API
	useEffect(() => {
		if (!isLoaded || typeof window === 'undefined') return

		const initPlaces = async () => {
			try {
				const library = await google.maps.importLibrary('places')
				const { AutocompleteSuggestion, AutocompleteSessionToken } =
					library as google.maps.PlacesLibrary

				if (AutocompleteSuggestion && AutocompleteSessionToken) {
					autocompleteSuggestionClassRef.current =
						AutocompleteSuggestion as typeof google.maps.places.AutocompleteSuggestion
					sessionTokenRef.current = new AutocompleteSessionToken()
					setReady(true)
				}
			} catch (error) {
				console.error('Error loading Places API:', error)
				setReady(false)
			}
		}

		initPlaces()
	}, [isLoaded])

	// Сброс highlightedIndex при изменении suggestions
	useEffect(() => {
		setHighlightedIndex(-1)
	}, [suggestions])

	// Установка значения из location prop
	useEffect(() => {
		if (location && location.address) {
			setValue(location.address)
		}
	}, [location])

	// Закрытие dropdown при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false)
				setSuggestions([])
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Функция для получения suggestions
	const fetchSuggestions = useCallback(
		async (input: string) => {
			if (
				!ready ||
				!autocompleteSuggestionClassRef.current ||
				!sessionTokenRef.current ||
				!input.trim()
			) {
				setSuggestions([])
				return
			}

			setIsFetching(true)

			try {
				const AutocompleteSuggestion = autocompleteSuggestionClassRef.current
				const currentSessionToken = sessionTokenRef.current

				if (!AutocompleteSuggestion || !currentSessionToken) {
					setSuggestions([])
					return
				}

				// Базовый запрос
				const request: {
					input: string
					sessionToken: google.maps.places.AutocompleteSessionToken
					includedRegionCodes: string[]
					includedPrimaryTypes?: string[]
				} = {
					input,
					sessionToken: currentSessionToken,
					includedRegionCodes: ['UA'],
				}

				// Добавляем типы, если они указаны
				if (types && types.length > 0) {
					const includedPrimaryTypes: string[] = []
					types.forEach(type => {
						if (type === 'address') {
							// Адреса: улицы, дома, здания, точки интереса
							includedPrimaryTypes.push('street_address')
							includedPrimaryTypes.push('premise')
							includedPrimaryTypes.push('route')
							includedPrimaryTypes.push('point_of_interest')
							includedPrimaryTypes.push('establishment')
						} else if (type === '(cities)' || type === 'locality') {
							// Населённые пункты (города, сёла)
							includedPrimaryTypes.push('locality')
						} else if (type === 'sublocality') {
							// Районы городов
							includedPrimaryTypes.push('sublocality')
						}
						// Не добавляем неизвестные типы
					})
					if (includedPrimaryTypes.length > 0) {
						request.includedPrimaryTypes = includedPrimaryTypes
					}
				}

				const response =
					await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

				if (response.suggestions) {
					const mappedSuggestions: Suggestion[] = response.suggestions
						.map((suggestion: google.maps.places.AutocompleteSuggestion) => {
							const prediction = suggestion.placePrediction
							if (!prediction) {
								return null
							}

							// Получаем текст из prediction
							const text = prediction.text?.text || ''

							// Получаем place_id из prediction
							const placeId =
								'place_id' in prediction
									? (prediction as { place_id?: string }).place_id
									: 'placeId' in prediction
									? (prediction as { placeId?: string }).placeId
									: ''

							const result: Suggestion = {
								description: text,
								place_id: placeId || '',
								structured_formatting: {
									main_text: text,
									secondary_text: text,
								},
								suggestion,
								placePrediction:
									prediction as unknown as google.maps.places.AutocompletePrediction,
							}
							return result
						})
						.filter((s): s is Suggestion => s !== null)

					setSuggestions(mappedSuggestions)
					setStatus(mappedSuggestions.length > 0 ? 'OK' : 'ZERO_RESULTS')
					setIsDropdownOpen(mappedSuggestions.length > 0)
				} else {
					setSuggestions([])
					setStatus('ZERO_RESULTS')
					setIsDropdownOpen(false)
				}
			} catch (error) {
				console.error('Error fetching suggestions:', error)
				setSuggestions([])
				setStatus('ERROR')
				setIsDropdownOpen(false)
			} finally {
				setIsFetching(false)
			}
		},
		[ready, types]
	)

	// Debounced функция для получения suggestions
	const debouncedFetchSuggestions = useCallback(
		(input: string) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			debounceTimerRef.current = setTimeout(() => {
				fetchSuggestions(input)
			}, 300)
		},
		[fetchSuggestions]
	)

	// Обработчик выбора предложения
	const handleSelect = useCallback(
		async (suggestion: Suggestion) => {
			// Используем place_id из placePrediction или напрямую из suggestion
			const placeId =
				suggestion.placePrediction?.place_id || suggestion.place_id
			if (!placeId) return

			setValue(suggestion.description)
			setSuggestions([])
			setIsDropdownOpen(false)
			setIsLoading(true)

			try {
				// Используем Geocoder для получения данных по placeId
				// Это более надежный способ, который работает с place_id
				const geocoder = new google.maps.Geocoder()

				geocoder.geocode(
					{
						placeId: placeId,
						language: 'uk',
						region: 'ua',
					},
					(results, status) => {
						if (status === 'OK' && results && results.length > 0) {
							const result = results[0]
							const locationData = getLocation(result)

							// Получаем координаты
							const location = result.geometry?.location
							const coordinates = location
								? {
										lat: location.lat(),
										lng: location.lng(),
								  }
								: undefined

							// Создаем новый session token для следующего запроса
							if (typeof window !== 'undefined' && google.maps?.places) {
								google.maps.importLibrary('places').then(library => {
									const { AutocompleteSessionToken } =
										library as google.maps.PlacesLibrary
									sessionTokenRef.current = new AutocompleteSessionToken()
								})
							}

							onLocationSelect?.({
								...locationData,
								coordinates,
							})
						} else {
							console.error('Geocoder failed:', status)
						}
						setIsLoading(false)
					}
				)
			} catch (error) {
				console.error('Error getting place details:', error)
			} finally {
				setIsLoading(false)
			}
		},
		[onLocationSelect]
	)

	// Обработчик изменения input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setValue(newValue)

		if (newValue.length === 0) {
			setSuggestions([])
			setIsDropdownOpen(false)
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		} else {
			setIsDropdownOpen(true)
			debouncedFetchSuggestions(newValue)
		}
	}

	// Обработчик фокуса на input
	const handleInputFocus = () => {
		if (value.length > 0 && suggestions.length > 0) {
			setIsDropdownOpen(true)
		}
	}

	// Обработчик нажатий клавиш
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!suggestions.length) return

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					setHighlightedIndex(prev =>
						prev < suggestions.length - 1 ? prev + 1 : 0
					)
					break
				case 'ArrowUp':
					e.preventDefault()
					setHighlightedIndex(prev =>
						prev > 0 ? prev - 1 : suggestions.length - 1
					)
					break
				case 'Enter':
					e.preventDefault()
					if (highlightedIndex >= 0) {
						handleSelect(suggestions[highlightedIndex])
					}
					break
				case 'Escape':
					setSuggestions([])
					setIsDropdownOpen(false)
					setHighlightedIndex(-1)
					break
			}
		},
		[suggestions, highlightedIndex, handleSelect]
	)

	// Обработчик очистки
	const handleClear = () => {
		setValue('')
		setSuggestions([])
		setIsDropdownOpen(false)
		setHighlightedIndex(-1)
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}
	}

	// Очистка таймера при размонтировании
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	return (
		<div className={cn('space-y-2', className)}>
			{label && (
				<Label htmlFor={inputRef.current?.id}>
					{label} {required && <span className='text-destructive'>*</span>}
				</Label>
			)}

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
				{(isLoading || isFetching) && (
					<div className='absolute right-2 top-1/2 -translate-y-1/2'>
						<LoadingSpinner size='sm' color='primary' />
					</div>
				)}

				{/* Dropdown */}
				{isDropdownOpen && status === 'OK' && suggestions.length > 0 && (
					<div className='absolute top-full z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-65 overflow-auto'>
						{suggestions.map((item, index) => (
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
				{isDropdownOpen && status === 'ZERO_RESULTS' && !isFetching && (
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

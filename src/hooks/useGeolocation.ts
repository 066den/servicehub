import { useCallback, useEffect, useState } from 'react'
import { useGoogleMaps } from '@/components/providers/GoogleMapsProvider'
import { LocationData } from '@/types'
import { getGeocode } from 'use-places-autocomplete'
import { getLocation } from '@/utils/getLocation'

interface GeolocationHookResult {
	location: LocationData | null
	isLoading: boolean
	error: string | null
	isSupported: boolean
	permission: PermissionState | null
	getCurrentLocation: () => Promise<void>
}

const useGeolocation = (): GeolocationHookResult => {
	const { isLoaded } = useGoogleMaps()
	const [location, setLocation] = useState<LocationData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [permission, setPermission] = useState<PermissionState | null>(null)
	const [isSupported, setIsSupported] = useState(false)

	useEffect(() => {
		if ('permissions' in navigator) {
			navigator.permissions.query({ name: 'geolocation' }).then(result => {
				setPermission(result.state)
				result.addEventListener('change', () => {
					setPermission(result.state)
				})
			})
		}
		if (
			isLoaded &&
			typeof window !== 'undefined' &&
			'geolocation' in navigator
		) {
			setIsSupported(true)
		}
	}, [isLoaded])

	const handlePosition = useCallback(async (position: GeolocationPosition) => {
		const coords = position.coords

		setIsLoading(true)
		setError(null)

		getGeocode({
			location: { lat: coords.latitude, lng: coords.longitude },
			language: 'uk',
			region: 'ua',
		})
			.then(results => {
				const result = results[0]
				const locationData = getLocation(result)
				setLocation({
					coordinates: {
						lat: coords.latitude,
						lng: coords.longitude,
					},
					...locationData,
				})
			})
			.catch(error => {
				console.error('Error getting coordinates:', error)
				setError('Невдалося отримати координати')
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [])

	const handleError = useCallback((error: GeolocationPositionError) => {
		setIsLoading(false)

		let errorMessage = 'Невідома помилка геолокації'

		switch (error.code) {
			case error.PERMISSION_DENIED:
				errorMessage = 'Доступ до геолокації заборонено користувачем'
				break
			case error.POSITION_UNAVAILABLE:
				errorMessage = 'Інформація про геолокацію недоступна'
				break
			case error.TIMEOUT:
				errorMessage = 'Час очікування геолокації вичерпано'
				break
		}

		setError(errorMessage)
	}, [])

	const getCurrentLocation = useCallback(async (): Promise<void> => {
		if (!isSupported) {
			setError('Геолокація не підтримується браузером')
			return
		}

		setIsLoading(true)
		setError(null)

		navigator.geolocation.getCurrentPosition(handlePosition, handleError)
	}, [handlePosition, handleError, isSupported])

	return {
		location,
		isLoading,
		error,
		isSupported,
		permission,
		getCurrentLocation,
	}
}

export default useGeolocation

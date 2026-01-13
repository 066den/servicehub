'use client'
import { useCallback, useRef, useEffect, useState } from 'react'

import { GoogleMap } from '@react-google-maps/api'
import { GeolocationData } from '@/types'
import { useGoogleMaps } from '../providers/GoogleMapsProvider'
import LoadingSpinner from '../ui/LoadingSpinner'

const defaultCenter = {
	lat: 50.4503596,
	lng: 30.5245025,
}

interface MapProps {
	center?: GeolocationData
	zoom?: number
	height?: number
}

interface MarkerLibrary {
	AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
}

const Map = ({ center, zoom, height }: MapProps) => {
	const mapRef = useRef<google.maps.Map | null>(null)
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null
	)
	const { isLoaded } = useGoogleMaps()
	const [markerLibrary, setMarkerLibrary] = useState<MarkerLibrary | null>(null)

	// Загружаем библиотеку marker
	useEffect(() => {
		if (isLoaded && google.maps) {
			google.maps.importLibrary('marker').then(marker => {
				setMarkerLibrary(marker as MarkerLibrary)
			})
		}
	}, [isLoaded])

	const onLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map
	}, [])

	const onUnmount = useCallback(() => {
		if (markerRef.current) {
			markerRef.current.map = null
			markerRef.current = null
		}
		mapRef.current = null
	}, [])

	// Создаем и обновляем маркер
	useEffect(() => {
		if (!mapRef.current || !markerLibrary || !isLoaded) return

		const position = center || defaultCenter
		const map = mapRef.current

		// Удаляем старый маркер, если он существует
		if (markerRef.current) {
			markerRef.current.map = null
			markerRef.current = null
		}

		// Создаем HTML элемент для иконки маркера
		const pinElement = document.createElement('img')
		pinElement.src = '/google-marker.svg'
		pinElement.style.width = '32px'
		pinElement.style.height = '32px'

		// Создаем новый AdvancedMarkerElement
		const AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement
		const marker = new AdvancedMarkerElement({
			map,
			position,
			content: pinElement,
		})

		markerRef.current = marker

		// Очистка при размонтировании
		return () => {
			if (markerRef.current) {
				markerRef.current.map = null
				markerRef.current = null
			}
		}
	}, [center, markerLibrary, isLoaded])

	const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

	return isLoaded ? (
		<GoogleMap
			mapContainerStyle={{
				width: '100%',
				height: height || '400px',
			}}
			center={center || defaultCenter}
			zoom={zoom || 12}
			onLoad={onLoad}
			onUnmount={onUnmount}
			options={{
				mapId: mapId || 'DEMO_MAP_ID',
				mapTypeControl: false,
				streetViewControl: false,
			}}
		/>
	) : (
		<LoadingSpinner />
	)
}

export default Map

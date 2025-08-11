import { useCallback, useRef } from 'react'

import { GoogleMap, Marker } from '@react-google-maps/api'
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

const Map = ({ center, zoom, height }: MapProps) => {
	const mapRef = useRef<google.maps.Map | null>(null)
	const { isLoaded } = useGoogleMaps()

	const onLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map
	}, [])

	const onUnmount = useCallback(() => {
		mapRef.current = null
	}, [])

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
				mapTypeControl: false,
				streetViewControl: false,
			}}
		>
			<Marker
				position={center || defaultCenter}
				icon={{ url: '/google-marker.svg' }}
			/>
		</GoogleMap>
	) : (
		<LoadingSpinner />
	)
}

export default Map

'use client'

import { useJsApiLoader } from '@react-google-maps/api'
import { createContext, useContext, ReactNode } from 'react'

const libraries: 'places'[] = ['places']

interface GoogleMapsContextType {
	isLoaded: boolean
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
	isLoaded: false,
})

export const useGoogleMaps = () => useContext(GoogleMapsContext)

interface GoogleMapsProviderProps {
	children: ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '',
		libraries,
		language: 'uk',
		region: 'UA',
	})

	return (
		<GoogleMapsContext.Provider value={{ isLoaded }}>
			{children}
		</GoogleMapsContext.Provider>
	)
}

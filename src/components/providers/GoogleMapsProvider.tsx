'use client'

import { useJsApiLoader } from '@react-google-maps/api'
import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from 'react'

const libraries: ('places' | 'marker')[] = ['places', 'marker']

interface GoogleMapsContextType {
	isLoaded: boolean
	loadMaps: () => void
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
	isLoaded: false,
	loadMaps: () => {},
})

export const useGoogleMaps = () => useContext(GoogleMapsContext)

interface GoogleMapsLoaderProps {
	children: ReactNode
	onLoadChange: (loaded: boolean) => void
}

function GoogleMapsLoader({ children, onLoadChange }: GoogleMapsLoaderProps) {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '',
		libraries,
		language: 'uk',
		region: 'UA',
	})

	// Уведомляем родительский компонент об изменении состояния загрузки
	useEffect(() => {
		onLoadChange(isLoaded)
	}, [isLoaded, onLoadChange])

	return <>{children}</>
}

interface GoogleMapsProviderProps {
	children: ReactNode
	loadOnMount?: boolean
}

export function GoogleMapsProvider({
	children,
	loadOnMount = false,
}: GoogleMapsProviderProps) {
	const [shouldLoad, setShouldLoad] = useState(loadOnMount)
	const [isLoaded, setIsLoaded] = useState(false)

	const loadMaps = () => {
		if (!shouldLoad) {
			setShouldLoad(true)
		}
	}

	return (
		<GoogleMapsContext.Provider
			value={{
				isLoaded,
				loadMaps,
			}}
		>
			{shouldLoad ? (
				<GoogleMapsLoader onLoadChange={setIsLoaded}>
					{children}
				</GoogleMapsLoader>
			) : (
				children
			)}
		</GoogleMapsContext.Provider>
	)
}

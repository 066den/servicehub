export const getLocation = (result: google.maps.GeocoderResult) => {
	const addressComponents = result.address_components
	let city = ''
	let area = ''

	addressComponents?.forEach(component => {
		if (component.types.includes('locality')) {
			city = component.long_name
		} else if (
			component.types.includes('administrative_area_level_1') &&
			!area
		) {
			area = component.long_name
		}
	})

	return {
		address: getShortAddress(result),
		city,
		area,
		placeId: result.place_id,
		formattedAddress: result.formatted_address,
	}
}

// Функция для работы с новым Places API (Place объект)
export const getLocationFromPlace = (place: google.maps.places.Place) => {
	const addressComponents = place.addressComponents
	let city = ''
	let area = ''

	addressComponents?.forEach(component => {
		const types = component.types
		if (types.includes('locality')) {
			city = component.longText || ''
		} else if (types.includes('administrative_area_level_1') && !area) {
			area = component.longText || ''
		}
	})

	const formattedAddress = place.formattedAddress || ''
	const coordinates = place.geometry?.location
		? {
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng(),
			}
		: undefined

	return {
		address: getShortAddressFromFormatted(formattedAddress),
		city,
		area,
		placeId: place.id || '',
		formattedAddress,
		coordinates,
	}
}

const getShortAddress = (result: google.maps.GeocoderResult) => {
	return result.formatted_address.split(',').slice(0, -2).join(',')
}

const getShortAddressFromFormatted = (formattedAddress: string) => {
	if (!formattedAddress) return ''
	return formattedAddress.split(',').slice(0, -2).join(',')
}

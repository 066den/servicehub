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
		address: result.formatted_address,
		city,
		area,
		placeId: result.place_id,
		formattedAddress: result.formatted_address,
	}
}

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

	// Получаем адрес с обработкой Plus Code
	let address = getShortAddress(result)
	
	// Если адрес пустой или содержит только Plus Code, используем city
	if (!address || isPlusCode(result.formatted_address || '')) {
		if (city) {
			address = city
			if (area && area !== city) {
				address = `${city}, ${area}`
			}
		}
	}

	return {
		address,
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
	
	// Получаем адрес с обработкой Plus Code
	let address = getShortAddressFromFormatted(formattedAddress)
	
	// Если адрес пустой или содержит только Plus Code, используем city
	if (!address || isPlusCode(formattedAddress)) {
		if (city) {
			address = city
			if (area && area !== city) {
				address = `${city}, ${area}`
			}
		}
	}
	
	// Используем type assertion, так как типы могут не включать geometry
	const placeWithGeometry = place as google.maps.places.Place & {
		geometry?: {
			location?: google.maps.LatLng
		}
	}
	const coordinates = placeWithGeometry.geometry?.location
		? {
				lat: placeWithGeometry.geometry.location.lat(),
				lng: placeWithGeometry.geometry.location.lng(),
		  }
		: undefined

	return {
		address,
		city,
		area,
		placeId: place.id || '',
		formattedAddress,
		coordinates,
	}
}

// Проверка на Plus Code (формат: XXXX+XX или XXXX+XX Название)
const isPlusCode = (address: string): boolean => {
	// Plus Code обычно начинается с паттерна вида "XXXX+XX" где X - буквы/цифры
	const plusCodePattern = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/
	return plusCodePattern.test(address.trim())
}

// Удаление Plus Code из адреса
const removePlusCode = (address: string): string => {
	// Удаляем Plus Code в начале строки (формат: "XXXX+XX " или "XXXX+XX Название")
	return address.replace(/^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*/, '').trim()
}

const getShortAddress = (result: google.maps.GeocoderResult) => {
	const formattedAddress = result.formatted_address || ''
	
	// Проверяем, содержит ли адрес Plus Code
	if (isPlusCode(formattedAddress)) {
		// Если есть Plus Code, используем city и area для формирования адреса
		const addressComponents = result.address_components
		const parts: string[] = []
		
		// Ищем locality (город)
		addressComponents?.forEach(component => {
			if (component.types.includes('locality')) {
				parts.push(component.long_name)
			}
		})
		
		// Если нет города, ищем administrative_area_level_2 (район)
		if (parts.length === 0) {
			addressComponents?.forEach(component => {
				if (component.types.includes('administrative_area_level_2')) {
					parts.push(component.long_name)
				}
			})
		}
		
		// Если все еще нет, используем адрес без Plus Code
		if (parts.length === 0) {
			const cleanedAddress = removePlusCode(formattedAddress)
			return cleanedAddress.split(',').slice(0, -2).join(',').trim() || cleanedAddress
		}
		
		return parts.join(', ')
	}
	
	// Обычная логика для нормальных адресов
	return formattedAddress.split(',').slice(0, -2).join(',').trim()
}

const getShortAddressFromFormatted = (formattedAddress: string) => {
	if (!formattedAddress) return ''
	
	// Проверяем, содержит ли адрес Plus Code
	if (isPlusCode(formattedAddress)) {
		// Удаляем Plus Code
		return removePlusCode(formattedAddress).split(',').slice(0, -2).join(',').trim()
	}
	
	return formattedAddress.split(',').slice(0, -2).join(',').trim()
}

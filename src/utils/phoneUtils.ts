const UKRAINE_MOBILE_CODE = [
	'050',
	'063',
	'066',
	'067',
	'068',
	'073',
	'093',
	'095',
	'096',
	'097',
	'098',
	'099',
]

const normalizePhone = (phone: string) => {
	const cleaned = phone.replace(/\D/g, '')
	if (cleaned.startsWith('380') && cleaned.length === 12) {
		return '+' + cleaned
	} else if (cleaned.startsWith('0') && cleaned.length === 10) {
		return '+380' + cleaned.slice(1)
	} else if (cleaned.length === 9) {
		return '+380' + cleaned
	}
	return '+' + cleaned
}

const validatePhone = (phone: string) => {
	const normalizedPhone = normalizePhone(phone)

	if (!/^\+380\d{9}$/.test(normalizedPhone)) {
		return false
	}

	const operatorCode = normalizedPhone.slice(3, 6)
	return UKRAINE_MOBILE_CODE.includes(operatorCode)
}

export { validatePhone, normalizePhone }

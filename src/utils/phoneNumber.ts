export const phoneMask = (phone: string) => {
	return phone.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
}

export const formatPhone = (value: string): string => {
	const digits = value.replace(/\D/g, '').slice(0, 10)
	if (digits.length <= 3) return digits
	if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
	if (digits.length <= 8)
		return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
	return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
		6,
		8
	)} ${digits.slice(8)}`
}

export const validatePhone = (phone: string): boolean => {
	// Украинский формат: 0XXXXXXXXX (где X - цифра)
	const phoneRegex = /^0[56789]\d{8}$/
	return phoneRegex.test(phone)
}

export const cleanPhone = (phone: string): string => {
	return phone.replace(/\D/g, '')
}

export const formatPhoneForDisplay = (phone: string): string => {
	const cleaned = cleanPhone(phone)
	if (cleaned.length === 0) return ''
	
	// Добавляем +38 если номер начинается с 0
	if (cleaned.startsWith('0') && cleaned.length === 10) {
		return `+38 ${formatPhone(cleaned)}`
	}
	
	return formatPhone(cleaned)
}

export const getPhoneCountryCode = (phone: string): string => {
	const cleaned = cleanPhone(phone)
	if (cleaned.startsWith('380')) return '+380'
	if (cleaned.startsWith('0')) return '+38'
	return '+38' // По умолчанию для Украины
}

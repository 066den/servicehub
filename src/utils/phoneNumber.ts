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

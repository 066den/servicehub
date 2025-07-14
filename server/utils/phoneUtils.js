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

const normalizePhoneNumber = phoneNumber => {
	const cleaned = phoneNumber.replace(/\D/g, '')
	if (cleaned.startsWith('380') && cleaned.length === 12) {
		return '+' + cleaned
	} else if (cleaned.startsWith('0') && cleaned.length === 10) {
		return '+380' + cleaned.slice(1)
	} else if (cleaned.length === 9) {
		return '+380' + cleaned
	}
	return '+' + cleaned
}

const validatePhoneNumber = phoneNumber => {
	const normalized = normalizePhoneNumber(phoneNumber)

	if (!/^\+380\d{9}$/.test(normalized)) {
		return false
	}
	const operatorCode = normalized.slice(3, 6)
	return UKRAINE_MOBILE_CODE.includes(operatorCode)
}

const getUkrainianOperator = phoneNumber => {
	const normalized = normalizePhoneNumber(phoneNumber)
	const operatorCode = normalized.slice(3, 6)

	const operators = {
		'050': 'Kyivstar',
		'063': 'Vodafone',
		'066': 'Kyivstar',
		'067': 'Kyivstar',
		'068': 'Kyivstar',
		'073': 'Lifecell',
		'093': 'Lifecell',
		'095': 'МТС Украина',
		'096': 'Київстар',
		'097': 'Київстар',
		'098': 'Київстар',
		'099': 'МТС Украина',
	}
	return operators[operatorCode] || 'Неизвестный оператор'
}

module.exports = {
	normalizePhoneNumber,
	validatePhoneNumber,
	getOperator: getUkrainianOperator,
	UKRAINE_MOBILE_CODE,
}

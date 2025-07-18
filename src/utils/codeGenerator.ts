import crypto from 'crypto'

const generateSecureCode = (length = 6) => {
	const buffer = crypto.randomBytes(length)
	let code = ''

	for (let i = 0; i < length; i++) {
		code += (buffer[i] % 10).toString()
	}

	return code
}

export { generateSecureCode }

const languageMiddleware = (req, res, next) => {
	const acceptLanguage = req.headers['accept-language'] || ''

	let language = process.env.DEFAULT_LANGUAGE || 'uk'

	if (acceptLanguage.includes('ru')) {
		language = 'ru'
	} else if (acceptLanguage.includes('uk')) {
		language = 'uk'
	}
	req.language = language

	next()
}

module.exports = languageMiddleware

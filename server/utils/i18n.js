const fs = require('fs')
const path = require('path')

class I18n {
	constructor() {
		this.locales = {}
		this.defaultLocale = process.env.DEFAULT_LOCALE || 'uk'
		this.loadLocales()
	}

	loadLocales() {
		const localesPath = path.join(__dirname, '..', 'locales')
		const files = fs.readdirSync(localesPath)

		files.forEach(file => {
			if (file.endsWith('.json')) {
				const locale = file.replace('.json', '')
				const content = fs.readFileSync(path.join(localesPath, file), 'utf8')
				this.locales[locale] = JSON.parse(content)
			}
		})
	}

	t(key, locale = this.defaultLocale, params = {}) {
		const keys = key.split('.')
		let value = this.locales[locale]

		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = value[k]
			} else {
				value = null
				break
			}
		}

		if (!value && locale !== this.defaultLocale) {
			return this.t(key, this.defaultLocale, params)
		}

		if (typeof value === 'string' && Object.keys(params).length > 0) {
			return value.replace(/{(\w+)}/g, (match, p1) => params[p1] || match)
		}

		return value || key
	}
}

module.exports = new I18n()

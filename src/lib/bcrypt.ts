// Обертка для bcryptjs с поддержкой ESM
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

type BcryptModule = {
	hash: (password: string, saltRounds: number) => Promise<string>
	compare: (password: string, hash: string) => Promise<boolean>
}

let bcrypt: BcryptModule | null = null

async function getBcrypt() {
	if (!bcrypt) {
		try {
			bcrypt = require('bcryptjs')
		} catch (error) {
			console.error('Failed to load bcryptjs:', error)
			throw new Error('bcryptjs module not found. Please run: npm install bcryptjs')
		}
	}
	return bcrypt
}

export async function hashPassword(password: string): Promise<string> {
	const bcryptModule = await getBcrypt()
	if (!bcryptModule) {
		throw new Error('bcrypt module not available')
	}
	const saltRounds = 12
	return await bcryptModule.hash(password, saltRounds)
}

export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	const bcryptModule = await getBcrypt()
	if (!bcryptModule) {
		throw new Error('bcrypt module not available')
	}
	return await bcryptModule.compare(password, hash)
}


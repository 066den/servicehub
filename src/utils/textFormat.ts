export const getFirstLetters = (phrase: string, count = 2) => {
	return phrase
		.replace(/[.,!@#$%^&*()_+=\-`~[\]/\\{}:"|<>?]+/gi, '')
		.trim()
		.split(/\s+/)
		.slice(0, count)
		.map((word: string) => {
			if (!word.length) return ''
			return word.match(/./u)![0].toUpperCase()
		})
		.join('')
}

const avatarColors = [
	'#F59E0B', // amber
	'#10B981', // emerald
	'#3B82F6', // blue
	'#8B5CF6', // violet
	'#EC4899', // pink
	'#F43F5E', // rose
	'#14B8A6', // teal
	'#F97316', // orange
	'#22C55E', // green
	'#0EA5E9', // sky
]

export function getAvatarColor(name: string): string {
	let hash = 0

	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash)
	}

	const index = Math.abs(hash) % avatarColors.length
	return avatarColors[index]
}

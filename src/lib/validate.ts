// File validation constants
const ALLOWED_FILE_TYPES = {
	IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
	VIDEOS: [
		'video/mp4',
		'video/webm',
		'video/ogg',
		'video/avi',
		'video/mov',
		'video/quicktime',
	],
	DOCUMENTS: ['application/pdf', 'application/msword'],
	AUDIO: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
} as const

const MAX_FILE_SIZE = {
	IMAGE: 5 * 1024 * 1024, // 5MB
	VIDEO: 1000 * 1024 * 1024, // 1000MB
	DOCUMENT: 10 * 1024 * 1024, // 10MB
	AUDIO: 50 * 1024 * 1024, // 50MB
} as const

const ERROR_MESSAGES = {
	FILE: {
		TYPE_NOT_ALLOWED: 'File type not allowed',
		SIZE_EXCEEDED: 'File size exceeded',
		VIDEO_SIZE_EXCEEDED:
			'Video file is too large. Maximum size is 1GB. Please compress your video or choose a smaller file.',
		IMAGE_SIZE_EXCEEDED: 'Image file is too large. Maximum size is 5MB.',
		AUDIO_SIZE_EXCEEDED: 'Audio file is too large. Maximum size is 50MB.',
		DOCUMENT_SIZE_EXCEEDED: 'Document file is too large. Maximum size is 10MB.',
	},
} as const

export const validateFile = (file: File): string | null => {
	if (
		!ALLOWED_FILE_TYPES.IMAGES.includes(
			file.type as (typeof ALLOWED_FILE_TYPES.IMAGES)[number]
		)
	) {
		return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
	}

	if (file.size > MAX_FILE_SIZE.IMAGE) {
		return ERROR_MESSAGES.FILE.IMAGE_SIZE_EXCEEDED
	}

	return null
}

export const validateVideoFile = (file: File): string | null => {
	if (
		!ALLOWED_FILE_TYPES.VIDEOS.includes(
			file.type as (typeof ALLOWED_FILE_TYPES.VIDEOS)[number]
		)
	) {
		return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
	}

	if (file.size > MAX_FILE_SIZE.VIDEO) {
		return ERROR_MESSAGES.FILE.VIDEO_SIZE_EXCEEDED
	}

	return null
}

export const validateAudioFile = (file: File): string | null => {
	if (
		!ALLOWED_FILE_TYPES.AUDIO.includes(
			file.type as (typeof ALLOWED_FILE_TYPES.AUDIO)[number]
		)
	) {
		return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
	}

	if (file.size > MAX_FILE_SIZE.AUDIO) {
		return ERROR_MESSAGES.FILE.AUDIO_SIZE_EXCEEDED
	}

	return null
}

export const validateDocumentFile = (file: File): string | null => {
	if (
		!ALLOWED_FILE_TYPES.DOCUMENTS.includes(
			file.type as (typeof ALLOWED_FILE_TYPES.DOCUMENTS)[number]
		)
	) {
		return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
	}

	if (file.size > MAX_FILE_SIZE.DOCUMENT) {
		return ERROR_MESSAGES.FILE.DOCUMENT_SIZE_EXCEEDED
	}

	return null
}

export const validateFileByType = (
	file: File,
	fileType: 'image' | 'video' | 'audio' | 'document'
): string | null => {
	switch (fileType) {
		case 'image':
			return validateFile(file)
		case 'video':
			return validateVideoFile(file)
		case 'audio':
			return validateAudioFile(file)
		case 'document':
			return validateDocumentFile(file)
		default:
			return ERROR_MESSAGES.FILE.TYPE_NOT_ALLOWED
	}
}


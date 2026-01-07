import { EStatus, LocationData } from '.'
import { ProviderType, Role } from '@prisma/client'
export interface AuthTokens {
	accessToken: string
	refreshToken: string
}

export interface AuthUser {
	id: number
	phone: string
	phoneNormalized: string
	isVerified: boolean
	isActive: boolean
}

export interface LoginResponse {
	success: boolean
	user: AuthUser
	tokens: AuthTokens
	message: string
}

export interface SendCodeResponse {
	success: boolean
	expiresAt: Date
	operator?: string
	cost?: number
	messageId?: string
	testMode?: boolean
	message: string
}

export interface AuthError {
	error: string
	code?: string
}

export interface SMSResult {
	error?: string
	userId?: number
	message?: string
	status?: EStatus
	provider?: string
	cost?: number
}

export interface UserProfile {
	id: number
	phone: string
	phoneNormalized: string
	firstName?: string
	lastName?: string
	location?: LocationData
	role?: Role
	avatar?: string
	isVerified: boolean
	isActive: boolean
	createdAt: string
	updatedAt: string
	lastLoginAt?: string
	activeSessions: number
	activeTokens: number
	stats: {
		totalOrders: number
		completedOrders: number
		totalServices: number
		rating: number
		earnings: number
	}
}

export interface Executor {
	type: ProviderType
	businessName: string
	description?: string
	phone?: string
	email?: string
	location?: LocationData
	serviceAreas?: unknown
	companyInfo?: CompanyInfo
	firstName?: string
	lastName?: string
	avatar?: string
	slug?: string
	id?: number
}

export interface CompanyInfo {
	legalForm?: string
	registrationNumber?: string
	taxNumber?: string
	legalAddress?: string
	bankDetails: Record<string, unknown>
	certificates: Record<string, unknown>
	foundedYear: number
	licenses: Record<string, unknown>
	website: string
}

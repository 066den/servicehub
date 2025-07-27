import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		user: {
			id: number
			phone: string
			firstName: string
			lastName: string
			phoneNormalized: string
			isVerified: boolean
		} & DefaultSession['user']
		accessToken?: string
		refreshToken?: string
		error?: string
	}

	interface User extends DefaultUser {
		id: string
		phone: string
		phoneNormalized: string
		isVerified: boolean
		error?: string
		status?: EStatus
		accessToken?: string
		refreshToken?: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		id: number
		phone: string
		phoneNormalized: string
		isVerified: boolean
		accessToken?: string
		refreshToken?: string
		accessTokenExpires?: number
	}
}

declare module 'next/server' {
	interface NextRequest {
		nextauth?: {
			token: JWT | null
		}
	}
}

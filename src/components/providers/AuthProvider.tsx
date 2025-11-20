'use client'
import { useEffect } from 'react'

import { SessionProvider, useSession } from 'next-auth/react'
import { useUserProfile } from '@/stores/auth/useUserProfile'

interface AuthProviderProps {
	children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
	const { status } = useSession()
	const { initialize, isInitialized, user } = useUserProfile()

	useEffect(() => {
		if (status !== 'loading' && !isInitialized) {
			initialize()
		}
	}, [initialize, status, isInitialized, user])

	return <>{children}</>
}

export function AuthProvider({ children }: AuthProviderProps) {
	return (
		<SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
			<AuthInitializer>{children}</AuthInitializer>
		</SessionProvider>
	)
}

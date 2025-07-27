'use client'
import { useEffect } from 'react'

import { useAuthStore } from '@/stores/authStore'
import { SessionProvider } from 'next-auth/react'

interface AuthProviderProps {
	children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
	const { initialize } = useAuthStore()

	useEffect(() => {
		initialize()
	}, [initialize])

	return <>{children}</>
}

export function AuthProvider({ children }: AuthProviderProps) {
	return (
		<SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
			<AuthInitializer>{children}</AuthInitializer>
		</SessionProvider>
	)
}

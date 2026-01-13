'use client'
import { useEffect, useRef } from 'react'

import { SessionProvider, useSession } from 'next-auth/react'
import { useUserProfile } from '@/stores/auth/useUserProfile'

interface AuthProviderProps {
	children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
	const { status, data: session } = useSession()
	const { initialize, isInitialized } = useUserProfile()
	const lastUserIdRef = useRef<number | null>(null)

	useEffect(() => {
		// Инициализируем когда сессия загружена
		if (status !== 'loading') {
			// Отслеживаем изменение пользователя по session.user.id
			const currentUserId = session?.user?.id || null
			const userIdChanged =
				lastUserIdRef.current !== null &&
				lastUserIdRef.current !== currentUserId

			// Если пользователь изменился или еще не инициализировано
			if (userIdChanged || !isInitialized) {
				// Обновляем ref с текущим ID пользователя
				lastUserIdRef.current = currentUserId
				// Передаем статус сессии для оптимизации - для неавторизованных не делаем запрос getSession()
				initialize(status as 'authenticated' | 'unauthenticated')
			}
		}
	}, [status, isInitialized, initialize, session?.user?.id])

	return <>{children}</>
}

export function AuthProvider({ children }: AuthProviderProps) {
	return (
		<SessionProvider
			refetchInterval={10 * 60} // Увеличено с 5 до 10 минут
			refetchOnWindowFocus={false} // Отключено для улучшения производительности
			basePath='/api/auth'
		>
			<AuthInitializer>{children}</AuthInitializer>
		</SessionProvider>
	)
}

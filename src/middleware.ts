import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(request) {
		const token = request.nextauth.token
		const { pathname } = request.nextUrl

		// Приклад: доступ до /admin тільки для ADMIN
		if (pathname.startsWith('/admin')) {
			if (!token || token.role !== 'ADMIN') {
				return NextResponse.redirect(new URL('/', request.url))
			}
		}

		// Логика для защищенных маршрутов
		if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
			if (!token || !token.isVerified) {
				return NextResponse.redirect(new URL('/auth/signin', request.url))
			}
		}

		//Если пользователь авторизован и заходит на страницу входа
		if (pathname.startsWith('/auth/signin') && token && token.isVerified) {
			return NextResponse.redirect(new URL('/profile', request.url))
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl

				if (
					pathname.startsWith('/api/auth/') ||
					pathname === '/' ||
					pathname.startsWith('/auth') ||
					pathname !== '/profile'
				) {
					return true
				}

				// Защищенные маршруты требуют токен
				return !!token
			},
		},
	}
)

export const config = {
	matcher: [
		/*
		 * Исключаем:
		 * - api/auth роуты (NextAuth)
		 * - _next/static (статические файлы)
		 * - _next/image (оптимизация изображений)
		 * - favicon.ico (иконка)
		 */
		'/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
	],
}

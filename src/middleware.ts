import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(request) {
		const token = request.nextauth.token
		const { pathname } = request.nextUrl

		// Доступ до /admin тільки для ADMIN, кроме /admin/login
		if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
			if (!token || token.role !== 'ADMIN') {
				return NextResponse.redirect(new URL('/admin/login', request.url))
			}
		}

		// Логика для защищенных маршрутов
		if (pathname.startsWith('/profile')) {
			if (!token || !token.isVerified) {
				const callbackUrl = encodeURIComponent(pathname)
				return NextResponse.redirect(
					new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url)
				)
			}
		}

		//Если пользователь авторизован и заходит на страницу входа
		if (pathname.startsWith('/auth/signin') && token && token.isVerified) {
			// Проверяем callbackUrl из query параметров
			const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
			const redirectUrl = callbackUrl
				? decodeURIComponent(callbackUrl)
				: '/profile'
			return NextResponse.redirect(new URL(redirectUrl, request.url))
		}

		// Если админ авторизован и заходит на страницу входа админа
		if (
			pathname.startsWith('/admin/login') &&
			token &&
			token.role === 'ADMIN'
		) {
			return NextResponse.redirect(new URL('/admin', request.url))
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				const { pathname } = req.nextUrl

				// Публичные маршруты
				if (
					pathname.startsWith('/api/auth/') ||
					pathname === '/' ||
					pathname.startsWith('/auth') ||
					pathname.startsWith('/admin/login')
				) {
					return true
				}

				// Защищенные маршруты требуют токен
				if (pathname.startsWith('/profile')) {
					return !!token
				}

				// Админские маршруты - всегда разрешаем доступ в authorized
				// Проверку роли делаем в middleware, чтобы контролировать редирект
				if (pathname.startsWith('/admin')) {
					return true
				}

				return true
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

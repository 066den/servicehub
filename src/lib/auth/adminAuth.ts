import { NextResponse } from 'next/server'
import { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

/**
 * Проверяет, является ли пользователь администратором
 * @param session - Сессия пользователя из next-auth
 * @returns NextResponse с ошибкой 403, если пользователь не админ, или null, если проверка пройдена
 */
export async function checkAdminAccess(
	session: Session | null
): Promise<NextResponse | null> {
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	})

	if (user?.role !== 'ADMIN') {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
	}

	return null
}

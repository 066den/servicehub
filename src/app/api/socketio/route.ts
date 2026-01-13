import { Server as HTTPServer } from 'http'
import { getSocketIO } from '@/lib/socket/server'

// Глобальная переменная для хранения HTTP сервера
const httpServer: HTTPServer | null = null
const ioInitialized = false

// Инициализация Socket.IO при первом запросе
function ensureSocketIOInitialized() {
	if (ioInitialized && httpServer) {
		return getSocketIO()
	}

	// Создаем HTTP сервер для Socket.IO
	// В production это должно быть сделано через кастомный server.ts
	// Здесь мы просто возвращаем ошибку, так как Socket.IO должен быть инициализирован через server.ts
	throw new Error(
		'Socket.IO должен быть инициализирован через кастомный сервер (server.ts)'
	)
}

export async function GET() {
	try {
		ensureSocketIOInitialized()
		return new Response('Socket.IO is running', { status: 200 })
	} catch {
		return new Response(
			JSON.stringify({ error: 'Socket.IO не инициализирован' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
}

export async function POST() {
	try {
		ensureSocketIOInitialized()
		return new Response('Socket.IO is running', { status: 200 })
	} catch {
		return new Response(
			JSON.stringify({ error: 'Socket.IO не инициализирован' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
}

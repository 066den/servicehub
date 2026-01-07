import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
	Notification,
} from '@/types/socket'
import { authService } from '@/services/authService'

let io: SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
> | null = null

export function initializeSocketIO(httpServer: HTTPServer) {
	if (io) {
		return io
	}

	io = new SocketIOServer<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(httpServer, {
		path: '/socket.io',
		cors: {
			origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
			methods: ['GET', 'POST'],
			credentials: true,
		},
		transports: ['websocket', 'polling'],
	})

	// Middleware для аутентификации
	io.use(async (socket, next) => {
		try {
			const token =
				socket.handshake.auth?.token ||
				socket.handshake.headers?.authorization?.replace('Bearer ', '')

			if (!token) {
				return next(new Error('Authentication token required'))
			}

			// Валидация токена через authService
			const { user, session } = await authService.validateAccessToken(token)

			if (!user || !session) {
				return next(new Error('Invalid authentication token'))
			}

			// Сохраняем данные пользователя в socket.data
			socket.data = {
				userId: user.id,
				userPhone: user.phoneNormalized ?? user.phone,
				sessionId: session.id,
				isVerified: user.isVerified,
			}

			next()
		} catch (error) {
			console.error('Socket authentication error:', error)
			next(new Error('Authentication failed'))
		}
	})

	// Обработка подключений
	io.on('connection', socket => {
		const { userId, userPhone } = socket.data

		console.log(
			`User ${userId} (${userPhone}) connected with socket ${socket.id}`
		)

		// Отправляем статус подключения
		socket.emit('connection_status', {
			connected: true,
			userId,
			timestamp: new Date(),
		})

		// Обработка ping
		socket.on('ping', () => {
			socket.emit('pong', {
				timestamp: new Date(),
			})
		})

		// Обработка присоединения к комнате
		socket.on('join_room', data => {
			socket.join(data.roomName)
			socket.emit('room_joined', {
				room: data.roomName,
			})
			console.log(`User ${userId} joined room: ${data.roomName}`)
		})

		// Обработка выхода из комнаты
		socket.on('leave_room', data => {
			socket.leave(data.roomName)
			socket.emit('room_left', {
				room: data.roomName,
			})
			console.log(`User ${userId} left room: ${data.roomName}`)
		})

		// Обработка отправки сообщения
		socket.on('send_message', data => {
			// Отправляем сообщение всем в комнате, кроме отправителя
			socket.to(data.roomName).emit('new_message', {
				userId,
				phone: userPhone,
				message: data.message,
				timestamp: new Date(),
				roomName: data.roomName,
			})
		})

		// Обработка обновления статуса
		socket.on('update_status', data => {
			// Отправляем обновление статуса всем подключенным пользователям
			io?.emit('user_status_changed', {
				userId,
				status: data.status,
				timestamp: new Date(),
			})
		})

		// Обработка обновления локации
		socket.on('update_location', data => {
			// Можно сохранить локацию в БД или отправить в комнату локации
			console.log(`User ${userId} updated location:`, data)
		})

		// Обработка подписки на уведомления
		socket.on('subscribe_notifications', data => {
			// Создаем комнату для уведомлений на основе категорий и локации
			const notificationRoom = `notifications:${
				data.location
			}:${data.categories.join(',')}`
			socket.join(notificationRoom)
			socket.emit('subscribed_notifications', {
				room: notificationRoom,
			})
			console.log(
				`User ${userId} subscribed to notifications: ${notificationRoom}`
			)
		})

		// Обработка отключения
		socket.on('disconnect', reason => {
			console.log(`User ${userId} disconnected: ${reason}`)
			// Отправляем обновление статуса
			io?.emit('user_status_changed', {
				userId,
				status: 'offline',
				timestamp: new Date(),
			})
		})

		// Обработка ошибок
		socket.on('error', error => {
			console.error(`Socket error for user ${userId}:`, error)
			socket.emit('error', {
				message: error.message || 'An error occurred',
				code: 'SOCKET_ERROR',
			})
		})
	})

	return io
}

export function getSocketIO() {
	if (!io) {
		throw new Error(
			'Socket.IO не инициализирован. Вызовите initializeSocketIO сначала.'
		)
	}
	return io
}

// Функция для отправки уведомления пользователю
export function sendNotificationToUser(
	userId: number,
	notification: Partial<Notification>
) {
	const socketIO = getSocketIO()

	// Находим все сокеты пользователя
	const userSockets = Array.from(socketIO.sockets.sockets.values()).filter(
		socket => socket.data?.userId === userId
	)

	userSockets.forEach(socket => {
		socket.emit('notification', {
			...notification,
			timestamp: new Date(),
		} as Notification)
	})
}

// Функция для отправки уведомления в комнату
export function sendNotificationToRoom(
	roomName: string,
	notification: Partial<Notification>
) {
	const socketIO = getSocketIO()
	socketIO.to(roomName).emit('notification', {
		...notification,
		timestamp: new Date(),
	} as Notification)
}

// Функция для принудительного отключения пользователя
export function disconnectUser(userId: number, reason: string) {
	const socketIO = getSocketIO()

	const userSockets = Array.from(socketIO.sockets.sockets.values()).filter(
		socket => socket.data?.userId === userId
	)

	userSockets.forEach(socket => {
		socket.emit('force_disconnect', {
			reason,
			message: 'Вы были отключены от сервера',
		})
		socket.disconnect(true)
	})
}

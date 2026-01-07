import { useEffect, useRef, useState } from 'react'
// @ts-expect-error - socket.io-client exports io but types may not be properly resolved
import { io } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socket'
import { getSession } from 'next-auth/react'

interface UseSocketOptions {
	autoConnect?: boolean
	onConnect?: () => void
	onDisconnect?: () => void
	onError?: (error: Error) => void
}

type TypedSocket = ReturnType<
	typeof io<ServerToClientEvents, ClientToServerEvents>
>

export function useSocket(options: UseSocketOptions = {}) {
	const { autoConnect = true, onConnect, onDisconnect, onError } = options
	const socketRef = useRef<TypedSocket | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!autoConnect) {
			return
		}

		let mounted = true

		async function connect() {
			try {
				// Получаем токен из сессии
				const session = await getSession()
				const token = session?.accessToken

				if (!token) {
					const err = new Error(
						'Токен доступа не найден. Необходима авторизация.'
					)
					setError(err)
					onError?.(err)
					return
				}

				// Создаем подключение к Socket.IO
				const socketUrl =
					process.env.NEXT_PUBLIC_SOCKET_URL ||
					(typeof window !== 'undefined'
						? window.location.origin
						: 'http://localhost:3000')
				const socket = io<ServerToClientEvents, ClientToServerEvents>(
					socketUrl,
					{
						path: '/socket.io',
						transports: ['websocket', 'polling'],
						auth: {
							token,
						},
						extraHeaders: {
							Authorization: `Bearer ${token}`,
						},
					}
				)

				socketRef.current = socket

				// Обработка подключения
				socket.on('connect', () => {
					if (mounted) {
						setIsConnected(true)
						setError(null)
						onConnect?.()
					}
				})

				// Обработка отключения
				socket.on('disconnect', () => {
					if (mounted) {
						setIsConnected(false)
						onDisconnect?.()
					}
				})

				// Обработка ошибок подключения
				socket.on('connect_error', (err: Error) => {
					if (mounted) {
						setError(err)
						onError?.(err)
					}
				})

				// Обработка статуса подключения
				socket.on('connection_status', (data: { connected: boolean }) => {
					if (mounted) {
						setIsConnected(data.connected)
					}
				})

				// Обработка принудительного отключения
				socket.on(
					'force_disconnect',
					(data: { reason: string; message: string }) => {
						if (mounted) {
							const err = new Error(data.message)
							setError(err)
							onError?.(err)
							socket.disconnect()
						}
					}
				)

				// Обработка ошибок
				socket.on('error', (data: { message: string; code?: string }) => {
					if (mounted) {
						const err = new Error(data.message)
						setError(err)
						onError?.(err)
					}
				})
			} catch (err) {
				if (mounted) {
					const error =
						err instanceof Error
							? err
							: new Error('Ошибка подключения к сокету')
					setError(error)
					onError?.(error)
				}
			}
		}

		connect()

		return () => {
			mounted = false
			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
			}
		}
	}, [autoConnect, onConnect, onDisconnect, onError])

	// Функция для ручного подключения
	const connect = () => {
		if (socketRef.current && !socketRef.current.connected) {
			socketRef.current.connect()
		}
	}

	// Функция для ручного отключения
	const disconnect = () => {
		if (socketRef.current && socketRef.current.connected) {
			socketRef.current.disconnect()
		}
	}

	// Функция для отправки ping
	const ping = () => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('ping')
		}
	}

	// Функция для присоединения к комнате
	const joinRoom = (roomName: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('join_room', { roomName })
		}
	}

	// Функция для выхода из комнаты
	const leaveRoom = (roomName: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('leave_room', { roomName })
		}
	}

	// Функция для отправки сообщения
	const sendMessage = (roomName: string, message: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('send_message', { roomName, message })
		}
	}

	// Функция для обновления статуса
	const updateStatus = (status: 'online' | 'busy' | 'away' | 'offline') => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('update_status', { status })
		}
	}

	// Функция для обновления локации
	const updateLocation = (
		latitude: number,
		longitude: number,
		city: string
	) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('update_location', { latitude, longitude, city })
		}
	}

	// Функция для подписки на уведомления
	const subscribeNotifications = (categories: string[], location: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit('subscribe_notifications', {
				categories,
				location,
			})
		}
	}

	return {
		socket: socketRef.current,
		isConnected,
		error,
		connect,
		disconnect,
		ping,
		joinRoom,
		leaveRoom,
		sendMessage,
		updateStatus,
		updateLocation,
		subscribeNotifications,
	}
}

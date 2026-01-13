import { useEffect } from 'react'
import { useSocket } from './useSocket'
import {
	Notification,
	ChatMessage,
	UserStatusChange,
	RoomJoinedData,
	RoomLeftData,
	OnlineCountData,
	PongData,
	ErrorData,
	ForceDisconnectData,
	SubscribedNotificationsData,
} from '@/types/socket'

interface UseSocketEventsOptions {
	onNotification?: (notification: Notification) => void
	onNewMessage?: (message: ChatMessage) => void
	onUserStatusChanged?: (data: UserStatusChange) => void
	onRoomJoined?: (room: string) => void
	onRoomLeft?: (room: string) => void
	onOnlineCount?: (count: number) => void
	onPong?: (timestamp: Date) => void
	onError?: (message: string, code?: string) => void
	onForceDisconnect?: (reason: string, message: string) => void
	onSubscribedNotifications?: (room: string) => void
}

export function useSocketEvents(options: UseSocketEventsOptions = {}) {
	const {
		onNotification,
		onNewMessage,
		onUserStatusChanged,
		onRoomJoined,
		onRoomLeft,
		onOnlineCount,
		onPong,
		onError,
		onForceDisconnect,
		onSubscribedNotifications,
	} = options

	const { socket, isConnected } = useSocket()

	useEffect(() => {
		if (!socket || !isConnected) {
			return
		}

		// Подписываемся на события
		if (onNotification) {
			socket.on('notification', onNotification)
		}

		if (onNewMessage) {
			socket.on('new_message', onNewMessage)
		}

		if (onUserStatusChanged) {
			socket.on('user_status_changed', onUserStatusChanged)
		}

		if (onRoomJoined) {
			socket.on('room_joined', (data: RoomJoinedData) =>
				onRoomJoined(data.room)
			)
		}

		if (onRoomLeft) {
			socket.on('room_left', (data: RoomLeftData) => onRoomLeft(data.room))
		}

		if (onOnlineCount) {
			socket.on('online_count', (data: OnlineCountData) =>
				onOnlineCount(data.count)
			)
		}

		if (onPong) {
			socket.on('pong', (data: PongData) => onPong(data.timestamp))
		}

		if (onError) {
			socket.on('error', (data: ErrorData) => onError(data.message, data.code))
		}

		if (onForceDisconnect) {
			socket.on('force_disconnect', (data: ForceDisconnectData) =>
				onForceDisconnect(data.reason, data.message)
			)
		}

		if (onSubscribedNotifications) {
			socket.on(
				'subscribed_notifications',
				(data: SubscribedNotificationsData) =>
					onSubscribedNotifications(data.room)
			)
		}

		// Очистка подписок при размонтировании
		return () => {
			if (onNotification) {
				socket.off('notification', onNotification)
			}
			if (onNewMessage) {
				socket.off('new_message', onNewMessage)
			}
			if (onUserStatusChanged) {
				socket.off('user_status_changed', onUserStatusChanged)
			}
			if (onRoomJoined) {
				socket.off('room_joined')
			}
			if (onRoomLeft) {
				socket.off('room_left')
			}
			if (onOnlineCount) {
				socket.off('online_count')
			}
			if (onPong) {
				socket.off('pong')
			}
			if (onError) {
				socket.off('error')
			}
			if (onForceDisconnect) {
				socket.off('force_disconnect')
			}
			if (onSubscribedNotifications) {
				socket.off('subscribed_notifications')
			}
		}
	}, [
		socket,
		isConnected,
		onNotification,
		onNewMessage,
		onUserStatusChanged,
		onRoomJoined,
		onRoomLeft,
		onOnlineCount,
		onPong,
		onError,
		onForceDisconnect,
		onSubscribedNotifications,
	])

	return { socket, isConnected }
}

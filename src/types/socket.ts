import { Socket as SocketIOSocket } from 'socket.io'
//import { Socket as ClientSocket } from 'socket.io-client';

// Базовые типы пользователя
export interface User {
	id: number
	phone: string
	phoneNormalized: string
	isVerified: boolean
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

// Типы сессии
export interface UserSession {
	id: number
	userId: number
	token: string
	refreshToken: string
	isActive: boolean
	expiresAt: Date
	lastActivityAt: Date
	ipAddress?: string
	userAgent?: string
	deviceInfo?: string
}

// Расширенный Socket с данными пользователя
export interface AuthenticatedSocket extends SocketIOSocket {
	userId: number
	userPhone: string
	sessionId: number
	isVerified: boolean
}

// События сервера -> клиент
export interface ServerToClientEvents {
	connection_status: (data: ConnectionStatus) => void
	notification: (data: Notification) => void
	new_message: (data: ChatMessage) => void
	user_status_changed: (data: UserStatusChange) => void
	room_joined: (data: RoomJoinedData) => void
	room_left: (data: RoomLeftData) => void
	online_count: (data: OnlineCountData) => void
	pong: (data: PongData) => void
	error: (data: ErrorData) => void
	force_disconnect: (data: ForceDisconnectData) => void
	subscribed_notifications: (data: SubscribedNotificationsData) => void
}

// События клиент -> сервер
export interface ClientToServerEvents {
	ping: () => void
	join_room: (data: JoinRoomData) => void
	leave_room: (data: LeaveRoomData) => void
	send_message: (data: SendMessageData) => void
	update_status: (data: UpdateStatusData) => void
	update_location: (data: UpdateLocationData) => void
	subscribe_notifications: (data: SubscribeNotificationsData) => void
}

// Данные между сокетами
export interface InterServerEvents {
	ping: () => void
}

// Данные в сокете
export interface SocketData {
	userId: number
	userPhone: string
	sessionId: number
	isVerified: boolean
}

// Типизированный сервер
export type TypedServer = SocketIOSocket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>

// Типизированный клиент
export type TypedClientSocket = SocketIOSocket<
	ServerToClientEvents,
	ClientToServerEvents
>

// Типы данных событий
export interface ConnectionStatus {
	connected: boolean
	userId?: number
	timestamp: Date
	reason?: string
}

export interface Notification {
	id?: number
	type:
		| 'info'
		| 'success'
		| 'warning'
		| 'error'
		| 'new_order'
		| 'order_status_changed'
		| 'order_accepted'
	title: string
	message: string
	timestamp: Date
	orderId?: number
	executorId?: number
	location?: string
	category?: string
	status?: string
}

export interface ChatMessage {
	userId: number
	phone: string
	message: string
	timestamp: Date
	roomName?: string
}

export interface UserStatusChange {
	userId: number
	status: UserStatus
	timestamp: Date
}

export interface RoomJoinedData {
	room: string
}

export interface RoomLeftData {
	room: string
}

export interface OnlineCountData {
	count: number
}

export interface PongData {
	timestamp: Date
}

export interface ErrorData {
	message: string
	code?: string
}

export interface ForceDisconnectData {
	reason: string
	message: string
}

export interface SubscribedNotificationsData {
	room: string
}

export interface JoinRoomData {
	roomName: string
}

export interface LeaveRoomData {
	roomName: string
}

export interface SendMessageData {
	roomName: string
	message: string
}

export interface UpdateStatusData {
	status: UserStatus
}

export interface UpdateLocationData {
	latitude: number
	longitude: number
	city: string
}

export interface SubscribeNotificationsData {
	categories: string[]
	location: string
}

// Типы статусов
export type UserStatus = 'online' | 'busy' | 'away' | 'offline'

// Типы комнат
export type RoomType = 'chat' | 'location' | 'category' | 'notifications'

// Геолокация
export interface Location {
	latitude: number
	longitude: number
	city: string
}

// Информация об устройстве
export interface DeviceInfo {
	type: 'mobile' | 'tablet' | 'desktop' | 'unknown'
	browser: string
	isMobile: boolean
	isTablet: boolean
	isDesktop: boolean
}

// Онлайн пользователь
export interface OnlineUser {
	userId: number
	phone: string
	status?: UserStatus
	connectedAt: Date
	location?: Location
}

// Статистика Socket.IO
export interface SocketStats {
	connectedUsers: number
	totalSockets: number
	rooms: string[]
}

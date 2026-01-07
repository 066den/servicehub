'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSocket } from '@/hooks/useSocket'
// @ts-expect-error - socket.io-client exports io but types may not be properly resolved
import { io } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

type TypedSocket = ReturnType<
	typeof io<ServerToClientEvents, ClientToServerEvents>
>

interface SocketContextValue {
	socket: TypedSocket | null
	isConnected: boolean
	error: Error | null
	connect: () => void
	disconnect: () => void
	ping: () => void
	joinRoom: (roomName: string) => void
	leaveRoom: (roomName: string) => void
	sendMessage: (roomName: string, message: string) => void
	updateStatus: (status: 'online' | 'busy' | 'away' | 'offline') => void
	updateLocation: (latitude: number, longitude: number, city: string) => void
	subscribeNotifications: (categories: string[], location: string) => void
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

interface SocketProviderProps {
	children: ReactNode
	autoConnect?: boolean
}

export function SocketProvider({
	children,
	autoConnect = true,
}: SocketProviderProps) {
	const socket = useSocket({
		autoConnect,
		onConnect: () => {
			console.log('Socket connected')
		},
		onDisconnect: () => {
			console.log('Socket disconnected')
		},
		onError: error => {
			console.error('Socket error:', error)
		},
	})

	return (
		<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
	)
}

export function useSocketContext() {
	const context = useContext(SocketContext)
	if (context === undefined) {
		throw new Error('useSocketContext must be used within a SocketProvider')
	}
	return context
}

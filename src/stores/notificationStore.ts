'use client'

import { INotification } from '@/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface NotificationState {
	notifications: INotification[]
	addNotification: (notification: INotification) => void
	removeNotification: (id: string) => void
	clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>()(
	devtools(
		(set, get) => ({
			notifications: [],

			addNotification: notification => {
				const id = `natif-${Date.now().toString()}-${Math.random()
					.toString(36)
					.substring(2, 9)}`
				const newNotification = {
					id,
					duration: 5000,
					persistent: false,
					...notification,
				}

				set(state => ({
					notifications: [newNotification, ...state.notifications].slice(0, 5),
				}))

				if (!newNotification.persistent && newNotification.duration) {
					setTimeout(() => {
						get().removeNotification(id)
					}, newNotification.duration)
				}
			},

			removeNotification: id => {
				set(state => ({
					notifications: state.notifications.filter(n => n.id !== id),
				}))
			},

			clearNotifications: () => {
				set({ notifications: [] })
			},
		}),
		{
			name: 'notification-store',
		}
	)
)

import React from 'react'
//import { useSocket } from './SocketProvider'
//import { Notification } from '../types/socket'

const NotificationSystem: React.FC = () => {
	//const { isConnected, notifications, removeNotification } = useSocket()

	// const getNotificationIcon = (type: Notification['type']): string => {
	// 	switch (type) {
	// 		case 'success':
	// 			return '✅'
	// 		case 'error':
	// 			return '❌'
	// 		case 'warning':
	// 			return '⚠️'
	// 		case 'new_order':
	// 			return '📋'
	// 		case 'order_accepted':
	// 			return '🤝'
	// 		case 'order_status_changed':
	// 			return '📄'
	// 		default:
	// 			return 'ℹ️'
	// 	}
	// }

	return (
		<>
			{/* Статус подключения */}
			{/* <div
				className={`connection-status ${
					isConnected ? 'connected' : 'disconnected'
				}`}
			>
				<span>{isConnected ? '🟢' : '🔴'}</span>
				{isConnected ? 'Подключено к ServiceHub' : 'Нет соединения'}
			</div> */}

			{/* Уведомления */}
			{/* <div className='notifications'>
				{notifications.map(notification => (
					<div
						key={notification.id}
						className={`notification notification-${notification.type}`}
						onClick={() => removeNotification(notification.id!)}
					>
						<div className='notification-icon'>
							{getNotificationIcon(notification.type)}
						</div>
						<div className='notification-content'>
							<h4>{notification.title}</h4>
							<p>{notification.message}</p>
							<small>
								{new Date(notification.timestamp).toLocaleTimeString()}
							</small>
						</div>
					</div>
				))}
			</div> */}
		</>
	)
}

export default NotificationSystem

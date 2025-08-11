'use client'
import { INotification, useNotificationStore } from '@/stores/notificationStore'
import Button from '../ui/Button'
import IconSvg from '../ui/IconSvg'
import { AnimatePresence, motion } from 'framer-motion'
import {
	progressFillVariants,
	systemNotificationVariants,
} from '../ui/animate/variants'

const Notification = ({ notification }: { notification: any }) => {
	const { persistent, duration, type, icon, title, message, actions, id } =
		notification

	const { removeNotification } = useNotificationStore(state => state)

	const handleClose = () => {
		if (id) {
			removeNotification(id)
		}
	}

	const getIcon = () => {
		const icons = {
			success: '✅',
			error: '❌',
			warning: '⚠️',
			info: 'ℹ️',
			message: '💬',
		}
		return icon || icons[type || 'info']
	}

	return (
		<div className={`notification-item ${type}`}>
			{!persistent && duration && (
				<motion.div
					variants={progressFillVariants}
					initial='hidden'
					animate='visible'
					transition={{ duration: duration / 1000 }}
					className='notification-progress'
				/>
			)}
			<div className='notification-content'>
				<div className='notification-icon'>{getIcon()}</div>
				<div className='notification-body'>
					{title && <div className='notification-title'>{title}</div>}
					<div className='notification-message'>{message}</div>
					{actions && (
						<div className='notification-actions'>
							{actions?.map(action => (
								<Button
									key={action.label}
									color='primary'
									size='sm'
									className='notification-action'
								>
									{action.label}
								</Button>
							))}
						</div>
					)}
				</div>
			</div>

			<Button
				round
				color='translucent'
				size='sm'
				ariaLabel='Close'
				className='notification-close'
				onClick={handleClose}
			>
				<IconSvg name='close' />
			</Button>
		</div>
	)
}

export const Notifications = () => {
	const notifications = useNotificationStore(state => state.notifications)

	return (
		<div className='notification-container'>
			<AnimatePresence>
				{notifications.map(notification => (
					<motion.div
						key={notification.id}
						variants={systemNotificationVariants}
						initial='hidden'
						animate='visible'
						exit='exit'
						layout
					>
						<Notification notification={notification} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	)
}

import { INotification, useNotificationStore } from '@/stores/notificationStore'

const useNotifications = () => {
	const store = useNotificationStore(state => state)

	const showSuccess = (notification: INotification) => {
		return store.addNotification({
			...notification,
			type: 'success',
		})
	}

	const showError = (notification: INotification) => {
		return store.addNotification({
			...notification,
			type: 'error',
		})
	}

	const showWarning = (notification: INotification) => {
		return store.addNotification({
			...notification,
			type: 'warning',
		})
	}

	const showInfo = (notification: INotification) => {
		return store.addNotification({
			...notification,
			type: 'info',
		})
	}

	const showMessage = (notification: INotification) => {
		return store.addNotification({
			...notification,
			type: 'message',
		})
	}

	return {
		...store,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		showMessage,
	}
}

export default useNotifications

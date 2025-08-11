'use client'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import Logo from '../common/Logo'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'

export default function LoadingPage() {
	const { isLoading } = useUserProfile()
	useBodyScrollLock(isLoading)

	if (!isLoading) return null

	return (
		<div className='loading-page'>
			<div className='particle' />
			<div className='particle' />
			<div className='particle' />
			<div className='particle' />
			<div className='loading-container'>
				<Logo color='white' size='lg' withSlogan={true} />

				<div className='loading-content'>
					<div className='loading-text'>Загружаем платформу...</div>

					<LoadingSpinner color='accent' size='lg' />

					{/* <div className='loading-dots'>
						<div className='dot' />
						<div className='dot' />
						<div className='dot' />
					</div> */}

					{/* <div className='progress-container'>
						<div className='progress-bar' />
					</div> */}

					{/* <div className='loading-messages'>
						<div className='loading-message'>Подключаемся к серверам...</div>
						<div className='loading-message'>Загружаем список услуг...</div>
						<div className='loading-message'>Синхронизируем данные...</div>
						<div className='loading-message'>Почти готово!</div>
					</div> */}
				</div>
			</div>
		</div>
	)
}

import Logo from '../common/Logo'

export default function LoadingPage() {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-primary-gradient'>
			<div className='relative text-center max-w-sm mx-auto px-4'>
				<Logo color='white' size='lg' withSlogan={true} withImage={false} />

				<div className='mt-8 space-y-4'>
					<div className='text-xl font-medium text-white/95'>
						Завантажуємо платформу...
					</div>

					{/* <LoadingSpinner color='accent' size='lg' /> */}
					<div className='relative h-2 w-full overflow-hidden rounded-full bg-primary/20'>
						<div className='bg-accent h-full rounded-full animate-progress-fill origin-left' />
					</div>
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


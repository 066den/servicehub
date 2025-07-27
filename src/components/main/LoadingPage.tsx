export default function LoadingPage() {
	return (
		<>
			<div className='particle' />
			<div className='particle' />
			<div className='particle' />
			<div className='particle' />
			<div className='loading-container'>
				<div className='logo'>
					Service<div className='hub-icon'></div>Hub
				</div>

				<div className='tagline'>Все услуги в одном месте</div>

				<div className='loading-content'>
					<div className='loading-text'>Загружаем платформу...</div>

					<div className='spinner-container'>
						<div className='spinner'></div>
					</div>

					<div className='loading-dots'>
						<div className='dot' />
						<div className='dot' />
						<div className='dot' />
					</div>

					<div className='progress-container'>
						<div className='progress-bar' />
					</div>

					<div className='loading-messages'>
						<div className='loading-message'>Подключаемся к серверам...</div>
						<div className='loading-message'>Загружаем список услуг...</div>
						<div className='loading-message'>Синхронизируем данные...</div>
						<div className='loading-message'>Почти готово!</div>
					</div>
				</div>
			</div>
		</>
	)
}

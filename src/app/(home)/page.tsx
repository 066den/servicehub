import HeroSection from '@/components/common/HeroSection'
//import HomeStats from '@/components/main/HomeStats'

const HomePage = () => {
	return (
		<div className='flex-1'>
			<HeroSection
				title='Всі послуги в одному місці'
				description='Знайдіть надійних фахівців для будь-яких завдань або запропонуйте свої послуги тисячам клієнтів'
				image='/assets/images/main-hero-3-1.webp'
			/>
			{/* <HomeStats /> */}
			<section className='min-h-[80vh] flex items-center justify-center bg-background py-16'>
				<div className='text-center max-w-4xl mx-auto px-6'>
					{/* Main Heading */}
					<h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight'>
						<span className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
							ServiceHub
						</span>
					</h1>

					{/* Subtitle */}
					<p className='text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed'>
						Інноваційна платформа для пошуку та надання послуг
					</p>

					{/* Description */}
					<p className='text-lg text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed'>
						З&apos;єднуємо професіоналів з клієнтами через зручну систему
						геолокації, верифікації та миттєвого взаємодії. Створюємо
						співтовариство довіри для якісного сервісу.
					</p>

					{/* Features Grid */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'>
						<div className='text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg border border-gray-100'>
							<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<svg
									className='w-8 h-8 text-blue-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-gray-800 mb-2'>
								Геолокация
							</h3>
							<p className='text-gray-600'>Швидкий пошук послуг поруч з вами</p>
						</div>

						<div className='text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg border border-gray-100'>
							<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<svg
									className='w-8 h-8 text-green-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-gray-800 mb-2'>
								Верификация
							</h3>
							<p className='text-gray-600'>Проверенные исполнители и отзывы</p>
						</div>

						<div className='text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg border border-gray-100'>
							<div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<svg
									className='w-8 h-8 text-purple-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13 10V3L4 14h7v7l9-11h-7z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-gray-800 mb-2'>
								Мгновенность
							</h3>
							<p className='text-gray-600'>Быстрое взаимодействие и заказ</p>
						</div>
					</div>

					{/* Status Badge */}
					<div className='mt-12 inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium'>
						<div className='w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse'></div>
						В разработке • Портфолио версия
					</div>
				</div>
			</section>
		</div>
	)
}

export default HomePage

import React from 'react'

const GradientExamples: React.FC = () => {
	return (
		<div className='p-8 space-y-6'>
			<h2 className='text-2xl font-bold text-dark-gray mb-6'>
				Примеры использования градиентов
			</h2>

			{/* Способ 1: Через Tailwind классы */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					1. Через Tailwind классы (рекомендуется)
				</h3>

				<div className='bg-primary-gradient text-white p-6 rounded-lg'>
					<h4 className='text-xl font-bold mb-2'>Primary Gradient</h4>
					<p>Используем bg-primary-gradient для фона</p>
				</div>

				<div className='bg-secondary-gradient text-white p-6 rounded-lg'>
					<h4 className='text-xl font-bold mb-2'>Secondary Gradient</h4>
					<p>Используем bg-secondary-gradient для фона</p>
				</div>

				<div className='bg-light-gradient text-dark-gray p-6 rounded-lg'>
					<h4 className='text-xl font-bold mb-2'>Light Gradient</h4>
					<p>Используем bg-light-gradient для фона</p>
				</div>
			</div>

			{/* Способ 2: Через CSS переменные напрямую */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					2. Через CSS переменные напрямую
				</h3>

				<div
					style={{ background: 'var(--primary-gradient)' }}
					className='text-white p-6 rounded-lg'
				>
					<h4 className='text-xl font-bold mb-2'>
						Primary Gradient (CSS переменная)
					</h4>
					<p>Используем style={{ background: 'var(--primary-gradient)' }}</p>
				</div>

				<div
					style={{ background: 'var(--secondary-gradient)' }}
					className='text-white p-6 rounded-lg'
				>
					<h4 className='text-xl font-bold mb-2'>
						Secondary Gradient (CSS переменная)
					</h4>
					<p>Используем style={{ background: 'var(--secondary-gradient)' }}</p>
				</div>
			</div>

			{/* Способ 3: Через CSS классы */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					3. Через CSS классы
				</h3>

				<div className='custom-primary-gradient text-white p-6 rounded-lg'>
					<h4 className='text-xl font-bold mb-2'>
						Primary Gradient (CSS класс)
					</h4>
					<p>Используем CSS класс .custom-primary-gradient</p>
				</div>
			</div>

			{/* Примеры кнопок с градиентами */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					4. Кнопки с градиентами
				</h3>

				<button className='bg-primary-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity'>
					Кнопка с Primary Gradient
				</button>

				<button className='bg-secondary-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity'>
					Кнопка с Secondary Gradient
				</button>
			</div>

			{/* Примеры карточек */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					5. Карточки с градиентами
				</h3>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='bg-primary-gradient text-white p-6 rounded-lg shadow-lg'>
						<h4 className='text-xl font-bold mb-2'>Карточка 1</h4>
						<p>Описание карточки с primary gradient</p>
					</div>

					<div className='bg-secondary-gradient text-white p-6 rounded-lg shadow-lg'>
						<h4 className='text-xl font-bold mb-2'>Карточка 2</h4>
						<p>Описание карточки с secondary gradient</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GradientExamples

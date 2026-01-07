import React from 'react'

const GradientTest: React.FC = () => {
	return (
		<div className='p-8 space-y-4'>
			<h2 className='text-2xl font-bold text-dark-gray'>Тест градиентов</h2>

			{/* Тест 1: Primary Gradient через Tailwind */}
			<div className='bg-primary-gradient text-white p-6 rounded-lg'>
				<h3 className='text-xl font-bold mb-2'>Primary Gradient (Tailwind)</h3>
				<p>bg-primary-gradient</p>
			</div>

			{/* Тест 2: Secondary Gradient через Tailwind */}
			<div className='bg-secondary-gradient text-white p-6 rounded-lg'>
				<h3 className='text-xl font-bold mb-2'>
					Secondary Gradient (Tailwind)
				</h3>
				<p>bg-secondary-gradient</p>
			</div>

			{/* Тест 3: Light Gradient через Tailwind */}
			<div className='bg-light-gradient text-dark-gray p-6 rounded-lg'>
				<h3 className='text-xl font-bold mb-2'>Light Gradient (Tailwind)</h3>
				<p>bg-light-gradient</p>
			</div>

			{/* Тест 4: Primary Gradient через CSS переменную */}
			<div className='text-white p-6 rounded-lg bg-primary-gradient'>
				<h3 className='text-xl font-bold mb-2'>
					Primary Gradient (CSS переменная)
				</h3>
				<p>
					<code>className=&apos;bg-primary-gradient&apos;</code>
				</p>
			</div>

			{/* Тест 5: Кнопка с градиентом */}
			<button className='bg-primary-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity'>
				Кнопка с Primary Gradient
			</button>

			{/* Тест 6: Карточка с градиентом */}
			<div className='bg-secondary-gradient text-white p-6 rounded-lg shadow-lg'>
				<h3 className='text-xl font-bold mb-2'>
					Карточка с Secondary Gradient
				</h3>
				<p>Это тестовая карточка для проверки работы градиентов</p>
			</div>

			{/* Тест 7: Карточка с градиентом */}
			<div className='bg-accent-gradient-light p-6 rounded-lg shadow-lg'>
				<h3 className='text-xl font-bold mb-2'>
					Карточка с Secondary Gradient
				</h3>
				<p>Это тестовая карточка для проверки работы градиентов</p>
			</div>
		</div>
	)
}

export default GradientTest

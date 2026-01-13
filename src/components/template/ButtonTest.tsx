import React from 'react'
import { Button } from '../ui/button'

export function ButtonTest() {
	return (
		<div className='p-8 space-y-8 bg-gray-50 min-h-screen'>
			<div className='max-w-6xl mx-auto'>
				<h1 className='text-4xl font-bold text-gray-900 mb-8 text-center'>
					🎨 Тест кнопок ServiceHub
				</h1>

				{/* Основные варианты */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
						Основные варианты кнопок
					</h2>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<Button variant='default' size='md'>
							Primary
						</Button>
						<Button variant='accent' size='md'>
							Accent
						</Button>
						<Button variant='destructive' size='md'>
							Destructive
						</Button>
						<Button variant='success' size='md'>
							Success
						</Button>
					</div>
				</div>

				{/* Outline варианты */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
						Outline кнопки с разными цветами бордера
					</h2>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<Button variant='outline-primary' size='md'>
							Primary Border
						</Button>
						<Button variant='outline-accent' size='md'>
							Accent Border
						</Button>
						<Button variant='outline-destructive' size='md'>
							Destructive Border
						</Button>
						<Button variant='outline-secondary' size='md'>
							Secondary Border
						</Button>
					</div>
				</div>

				{/* Размеры */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h2 className='text-2xl font-semibold text-gray-800 mb-6'>
						Размеры кнопок
					</h2>
					<div className='flex flex-wrap gap-4 items-center'>
						<Button variant='default' size='sm'>
							Small
						</Button>
						<Button variant='default' size='default'>
							Default
						</Button>
						<Button variant='default' size='md'>
							Medium
						</Button>
						<Button variant='default' size='lg'>
							Large
						</Button>
						<Button variant='default' size='icon'>
							🔍
						</Button>
						<Button variant='default' size='round'>
							+
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

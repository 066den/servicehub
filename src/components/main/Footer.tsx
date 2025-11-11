import Link from 'next/link'

const Footer = () => {
	return (
		<footer className='bg-dark-gray py-10'>
			<div className='container'>
				<div className='grid grid-cols-4 gap-10 mb-10'>
					<div className='space-y-2.5'>
						<h4 className='text-accent'>UslugiUA</h4>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Про нас
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Як це працює
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Блог
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Карьєра
						</Link>
					</div>

					<div className='space-y-2.5'>
						<h4 className='text-accent'>Для клієнтів</h4>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Як замовити послугу
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Безпека
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Гарантії
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Допомога
						</Link>
					</div>

					<div className='space-y-2.5'>
						<h4 className='text-accent'>Для виконавців</h4>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Стати виконавцем
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Комісії
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Правила
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							CRM система
						</Link>
					</div>

					<div className='space-y-2.5'>
						<h4 className='text-accent'>Контакти</h4>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							+380 (44) 123-45-67
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							support@uslugi.ua
						</Link>
						<Link className='block text-light hover:text-white mb-2.5' href='#'>
							Київ, вул. Хрещатик, 1
						</Link>
					</div>
				</div>

				<div className='border-t border-gray-700 pt-7.5 text-center text-gray-400'>
					<p>&copy; 2025 UslugiUA. Всі права захищені.</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer

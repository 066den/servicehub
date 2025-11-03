import Link from 'next/link'

const Footer = () => {
	return (
		<footer className='bg-dark-gray py-10'>
			<div className='container'>
				<div className='grid grid-cols-4 gap-10'>
					<div className='footer-section'>
						<h4 className='text-accent'>UslugiUA</h4>
						<Link className='text-light' href='#'>
							Про нас
						</Link>
						<Link className='text-light' href='#'>
							Як це працює
						</Link>
						<Link className='text-light' href='#'>
							Блог
						</Link>
						<Link className='text-light' href='#'>
							Карьєра
						</Link>
					</div>

					<div className='footer-section'>
						<h4 className='text-accent'>Для клієнтів</h4>
						<Link className='text-light' href='#'>
							Як замовити послугу
						</Link>
						<Link className='text-light' href='#'>
							Безпека
						</Link>
						<Link className='text-light' href='#'>
							Гарантії
						</Link>
						<Link className='text-light' href='#'>
							Допомога
						</Link>
					</div>

					<div className='footer-section'>
						<h4 className='text-accent'>Для виконавців</h4>
						<Link className='text-light' href='#'>
							Стати виконавцем
						</Link>
						<Link className='text-light' href='#'>
							Комісії
						</Link>
						<Link className='text-light' href='#'>
							Правила
						</Link>
						<Link className='text-light' href='#'>
							CRM система
						</Link>
					</div>

					<div className='footer-section'>
						<h4 className='text-accent'>Контакти</h4>
						<Link className='text-light' href='#'>
							+380 (44) 123-45-67
						</Link>
						<Link className='text-light' href='#'>
							support@servicehub.ua
						</Link>
						<Link className='text-light' href='#'>
							Київ, вул. Хрещатик, 1
						</Link>
					</div>
				</div>

				<div className='footer-bottom'>
					<p>&copy; 2025 ServiceHub. Всі права захищені.</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer

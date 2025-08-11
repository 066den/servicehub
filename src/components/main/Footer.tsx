import Link from 'next/link'

const Footer = () => {
	return (
		<footer className='footer'>
			<div className='container'>
				<div className='footer-content'>
					<div className='footer-section'>
						<h4>ServiceHub</h4>
						<Link className='link' href='#'>
							Про нас
						</Link>
						<Link className='link' href='#'>
							Як це працює
						</Link>
						<Link className='link' href='#'>
							Блог
						</Link>
						<Link className='link' href='#'>
							Карьєра
						</Link>
					</div>

					<div className='footer-section'>
						<h4>Для клієнтів</h4>
						<Link className='link' href='#'>
							Як замовити послугу
						</Link>
						<Link className='link' href='#'>
							Безпека
						</Link>
						<Link className='link' href='#'>
							Гарантії
						</Link>
						<Link className='link' href='#'>
							Допомога
						</Link>
					</div>

					<div className='footer-section'>
						<h4>Для виконавців</h4>
						<Link className='link' href='#'>
							Стати виконавцем
						</Link>
						<Link className='link' href='#'>
							Комісії
						</Link>
						<Link className='link' href='#'>
							Правила
						</Link>
						<Link className='link' href='#'>
							CRM система
						</Link>
					</div>

					<div className='footer-section'>
						<h4>Контакти</h4>
						<Link className='link' href='#'>
							+380 (44) 123-45-67
						</Link>
						<Link className='link' href='#'>
							support@servicehub.ua
						</Link>
						<Link className='link' href='#'>
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

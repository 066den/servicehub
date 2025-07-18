import Link from 'next/link'

import Navigation from '../ui/Navigation'
import { getTranslations } from 'next-intl/server'

const t = await getTranslations('Link')

const navigationItems = [
	{
		label: t('services'),
		href: '/services',
	},
	{
		label: t('about'),
		href: '/about',
	},
	{
		label: t('contact'),
		href: '/contact',
	},
]

const Header = () => {
	return (
		<header className='header'>
			<div className='container'>
				<div className='header-content'>
					<Link href='/' className='logo sm link'>
						Service<div className='hub-icon'></div>Hub
					</Link>

					<Navigation items={navigationItems} />

					<div className='header-buttons'>
						<Link href='/auth/sign-in' className='Button outline md'>
							Увійти
						</Link>
						<Link href='/auth/sign-up' className='Button accent md'>
							Стати виконавцем
						</Link>
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header

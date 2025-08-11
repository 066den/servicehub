import { useTranslations } from 'next-intl'
import Logo from '@/components/common/Logo'
import '@/components/auth/auth.scss'
import Link from 'next/link'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const t = useTranslations('Auth')
	return (
		<div className='auth-content'>
			<Link className='back-link' href='/'>
				← На головну
			</Link>
			<div className='auth-container'>
				<div className='auth-visual'>
					<Logo color='white' />
					<h2>{t('authVisual.title')}</h2>
					<p className='auth-visual-text'>{t('authVisual.subtitle')}</p>

					<ul className='features-list'>
						<li>
							<div className='feature-icon'>✨</div>
							<span>Перевірені фахівці</span>
						</li>
						<li>
							<div className='feature-icon'>🛡️</div>
							<span>Безпечні платежі</span>
						</li>
						<li>
							<div className='feature-icon'>⭐</div>
							<span>Система рейтингів</span>
						</li>
						<li>
							<div className='feature-icon'>📱</div>
							<span>Зручний інтерфейс</span>
						</li>
					</ul>
				</div>
				<div className='auth-form'>{children}</div>
			</div>
		</div>
	)
}

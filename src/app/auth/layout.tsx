import { useTranslations } from 'next-intl'

import './auth.scss'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const t = useTranslations('Auth')
	return (
		<div>
			<div className='auth-content'>
				<div className='auth-container'>
					<div className='auth-visual'>
						<div className='logo white'>
							Service<div className='hub-icon'></div>Hub
						</div>
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
		</div>
	)
}

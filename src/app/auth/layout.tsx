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
						<p className='auth-visual-text'>{t('authVisual.title')}</p>
						<div className='auth-stats'>
							{/* <div className='stat-item'>
								<span className='stat-number'>15K+</span>
								<div className='stat-label'>Исполнителей</div>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>50K+</span>
								<div className='stat-label'>Клиентов</div>
							</div> */}
							<div className='stat-item'>
								<span className='stat-number'>99.9%</span>
								<div className='stat-label'>{t('authStats.security')}</div>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>5 сек</span>
								<div className='stat-label'>{t('authStats.loginTime')}</div>
							</div>
						</div>
					</div>
					<div className='auth-form'>{children}</div>
				</div>
			</div>
		</div>
	)
}

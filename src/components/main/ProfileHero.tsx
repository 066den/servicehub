'use client'

import useNotifications from '@/hooks/storeHooks/useNotifications'
import { Button } from '../ui/button'
import './ProfileHero.scss'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { formatDateToString } from '@/utils/dateFormat'
import { Avatar } from '../common/Avatar'

const ProfileHero = () => {
	const { showSuccess } = useNotifications()
	const { user } = useUserProfile()

	const { displayName, createdAt, isVerified, location } = user || {}

	const handleEditProfile = () => {
		showSuccess({
			title: 'Профіль оновлено',
			message: 'Профіль успішно оновлено',
			persistent: true,
		})
	}

	return (
		<section className='profile-hero'>
			<div className='container'>
				<div className='hero-content'>
					<Avatar size='lg' icon='📷' />

					<div className='profile-info'>
						<h1>{displayName}</h1>

						<div className='profile-meta'>
							{location?.city && (
								<div className='meta-item'>📍 {location.city}</div>
							)}
							<div className='meta-item'>
								📅 На платформі з{' '}
								{createdAt ? formatDateToString(createdAt) : '—'}
							</div>

							<div className='meta-item'>
								{isVerified
									? '✅ Підтверджений профіль'
									: '❌ Непідтверджений профіль'}
							</div>
						</div>

						<div className='profile-stats'>
							<div className='stat-item'>
								<span className='stat-number'>24</span>
								<span className='stat-label'>Замовлень</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>8</span>
								<span className='stat-label'>Відгуків</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>12</span>
								<span className='stat-label'>Обраних</span>
							</div>
						</div>
					</div>

					<div className='btn-column'>
						<Button color='white' onClick={handleEditProfile}>
							✏️ Редагувати профіль
						</Button>
						<Button color='outline-white'>⚙️ Налаштування</Button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default ProfileHero

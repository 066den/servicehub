import { useUserProfile } from '@/stores/auth/useUserProfile'
import { formatDateToString } from '@/utils/dateFormat'
import { Badge } from '../ui/badge'
import AvatarEditable from '../ui/AvatarEditable'

const ProfileHero = () => {
	const { user, displayName, uploadAvatar, removeAvatar } = useUserProfile()

	const { createdAt, isVerified, location } = user || {}

	return (
		<div className='flex items-center mb-6 bg-light-gradient gap-4 border-l-4 border-primary rounded-lg p-4'>
			<AvatarEditable
				size='lg'
				src={user?.avatar}
				alt={displayName}
				onUpload={uploadAvatar}
				onRemove={removeAvatar}
			/>

			<div className='flex-1'>
				<h1 className='text-3xl font-bold text-primary mb-2'>{displayName}</h1>

				<div className='flex items-center gap-2'>
					{location?.city && (
						<Badge variant='outline' className='text-primary' size='md'>
							📍 {location.city}
						</Badge>
					)}
					<Badge variant='outline' className='text-primary' size='md'>
						📅 На платформі з {createdAt ? formatDateToString(createdAt) : '—'}
					</Badge>

					<Badge variant='outline' className='text-primary' size='md'>
						{isVerified
							? '✅ Підтверджений профіль'
							: '❌ Непідтверджений профіль'}
					</Badge>
				</div>

				{/* <div className='profile-stats'>
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
						</div> */}
			</div>
		</div>
	)
}

export default ProfileHero

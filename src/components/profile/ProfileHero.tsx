import { ReactNode } from 'react'
import AvatarEditable from '../ui/AvatarEditable'

type ProfileType = 'user' | 'executor' | 'staff'

interface ProfileHeroProps {
	type: ProfileType
	// Общие поля
	avatar?: string | null
	displayName: string
	alt?: string
	onUpload?: (file: File) => Promise<void>
	onRemove?: () => Promise<void>
	// Бейджи
	badges?: ReactNode
}

const ProfileHero = ({
	type,
	avatar,
	displayName,
	alt,
	onUpload,
	onRemove,
	badges,
}: ProfileHeroProps) => {
	return (
		<div className='flex items-center mb-6 bg-light-gradient gap-4 border-l-4 border-primary rounded-lg p-4'>
			<AvatarEditable
				isExecutor={type === 'executor'}
				size='lg'
				src={avatar ?? undefined}
				alt={alt || displayName}
				onUpload={onUpload}
				onRemove={onRemove}
			/>

			<div className='flex-1'>
				<h1 className='text-3xl font-bold text-primary mb-2'>{displayName}</h1>

				{badges && (
					<div className='flex items-center gap-2 flex-wrap'>{badges}</div>
				)}

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

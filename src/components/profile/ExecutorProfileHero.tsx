import { formatDateToString } from '@/utils/dateFormat'
import { Badge } from '../ui/badge'
import AvatarEditable from '../ui/AvatarEditable'
import { useProvider } from '@/stores/provider/useProvider'

const ExecutorProfileHero = () => {
	const { provider, uploadAvatar, removeAvatar } = useProvider()

	const displayName =
		provider?.businessName ||
		[provider?.firstName, provider?.lastName].filter(Boolean).join(' ') ||
		'—'
	const location =
		typeof provider?.location === 'object'
			? (provider.location as { city?: string })
			: undefined
	const createdAt = (provider as unknown as { createdAt?: string })?.createdAt
	const isVerified =
		(provider as unknown as { isVerified?: boolean })?.isVerified ?? false

	return (
		<div className='flex items-center mb-6 bg-light-gradient gap-4 border-l-4 border-primary rounded-lg p-4'>
			<AvatarEditable
				isExecutor
				size='lg'
				src={provider?.avatar}
				alt={provider?.businessName}
				onUpload={uploadAvatar}
				onRemove={removeAvatar}
			/>

			<div className='flex-1'>
				<h1 className='text-3xl font-bold text-primary mb-2'>{displayName}</h1>

				<div className='flex items-center gap-2'>
					{location?.city && (
						<Badge variant='default' size='md'>
							📍 {location.city}
						</Badge>
					)}
					<Badge variant='default' size='md'>
						На платформі з {createdAt ? formatDateToString(createdAt) : '—'}
					</Badge>

					<Badge variant='default' size='md'>
						{isVerified ? '✅ Підтверджений' : '❌ Непідтверджений'}
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

export default ExecutorProfileHero

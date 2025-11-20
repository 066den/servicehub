import { ProviderType } from '@prisma/client'
import { Button } from '../ui/button'
import Modal from './Modal'
import { useTranslations } from 'next-intl'
import { useProvider } from '@/stores/provider/useProvider'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'

interface ChangeTypeModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	selectedType: ProviderType
	setSelectedType: (type: ProviderType) => void
}

const ChangeTypeModal = ({
	isOpen,
	onClose,
	onConfirm,
	selectedType,
	setSelectedType,
}: ChangeTypeModalProps) => {
	const { isLoadingProvider, provider } = useProvider()

	const t = useTranslations()

	return (
		<Modal
			title={t('Profile.changeTypeTitle')}
			subtitle={t('Profile.changeTypeSubtitle')}
			size='lg'
			isOpen={isOpen}
			onClose={onClose}
			footer={
				<div className='flex justify-end gap-2'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isLoadingProvider}
					>
						{t('Profile.cancel')}
					</Button>
					<Button
						onClick={onConfirm}
						loading={isLoadingProvider}
						disabled={selectedType === provider?.type}
					>
						{t('Profile.changeTypeConfirm')}
					</Button>
				</div>
			}
		>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div
					className={cn(
						'border-2 border-gray-200 rounded-lg p-4 cursor-pointer text-center relative transition-all hover:border-primary hover:shadow-md hover:translate-y-[-2px]',
						selectedType === ProviderType.INDIVIDUAL &&
							'border-primary bg-primary/10'
					)}
					onClick={() => setSelectedType(ProviderType.INDIVIDUAL)}
				>
					<input
						type='radio'
						checked={selectedType === ProviderType.INDIVIDUAL}
						onChange={() => setSelectedType(ProviderType.INDIVIDUAL)}
						className='hidden'
					/>
					{selectedType === ProviderType.INDIVIDUAL && (
						<Badge variant='success' className='absolute top-2 right-2'>
							{t('Profile.selected')}
						</Badge>
					)}
					<div className='text-5xl mb-2'>🙋‍♂️</div>
					<div className='text-xl font-semibold mb-1'>
						{t('Profile.individual')}
					</div>
					<div className='text-sm text-gray-500'>
						{t('Profile.individualDescription')}
					</div>
				</div>

				<div
					className={cn(
						'border-2 border-gray-200 rounded-lg p-4 cursor-pointer text-center relative transition-all hover:border-primary hover:shadow-md hover:translate-y-[-2px]',
						selectedType === ProviderType.COMPANY &&
							'border-primary bg-primary/10'
					)}
					onClick={() => setSelectedType(ProviderType.COMPANY)}
				>
					<input
						type='radio'
						checked={selectedType === ProviderType.COMPANY}
						onChange={() => setSelectedType(ProviderType.COMPANY)}
						className='hidden'
					/>
					{selectedType === ProviderType.COMPANY && (
						<Badge variant='success' className='absolute top-2 right-2'>
							{t('Profile.selected')}
						</Badge>
					)}
					<div className='text-5xl mb-4'>🏢</div>
					<div className='text-xl font-semibold mb-2 text-gray-900'>
						{t('Profile.company')}
					</div>
					<div className='text-sm text-gray-500 leading-relaxed'>
						{t('Profile.companyDescription')}
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ChangeTypeModal

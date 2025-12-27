import { Service } from '@/types'
import { Card } from '../ui/card'
import Image from 'next/image'
import { formatPrice, formatDuration } from '@/utils/textFormat'
import { Clock, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useProviderService } from '@/stores/service/useProviderService'

interface ServiceCardEditProps {
	service: Service
	onEdit: (id: number) => void
}

export const ServiceCardEdit = ({ service, onEdit }: ServiceCardEditProps) => {
	const {
		id,
		name,
		shortDescription,
		duration,
		photos,
		type,
		isActive,
		pricingOptions,
		price,
	} = service
	const { toggleActive } = useProviderService()
	const mainPhoto = photos?.find(photo => photo.isMain)
	const priceText = formatPrice(
		price,
		pricingOptions as Parameters<typeof formatPrice>[1]
	)

	const hadleClick = () => {
		onEdit(id)
	}

	const handleActivate = () => {
		toggleActive(id)
	}

	return (
		<Card className='p-4 gap-4 hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-5px] transition-all duration-300'>
			<div className='flex items-center'>
				<div className='relative w-[30%] aspect-square rounded-lg overflow-hidden flex-shrink-0 mr-3'>
					{mainPhoto ? (
						<Image
							src={mainPhoto.url}
							alt={mainPhoto.alt || name}
							fill
							className='object-cover'
							sizes='100px'
						/>
					) : (
						<div className='w-full h-full bg-accent-gradient-light flex items-center justify-center text-4xl'>
							{type?.icon}
						</div>
					)}
				</div>
				<div className='flex-1 space-y-2'>
					<h3 className='text-lg font-semibold text-gray-900'>{name}</h3>
					{duration && (
						<div className='flex items-center gap-1 text-sm text-secondary'>
							<Clock className='size-3.5' />
							{formatDuration(duration)}
						</div>
					)}
					<Badge variant={isActive ? 'success' : 'accent'} size='sm'>
						{isActive ? 'Активна' : 'На паузі'}
					</Badge>
				</div>
			</div>

			{shortDescription && (
				<p className='text-secondary-foreground text-sm'>{shortDescription}</p>
			)}
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<span className='text-sm text-secondary-foreground flex items-center gap-1'>
					<Star fill='currentColor' className='size-4 text-yellow-500' /> 4.9
					(45 відгуків)
				</span>

				<div className='text-lg font-semibold'>{priceText}</div>
			</div>

			<div className='flex gap-2'>
				<Button variant='outline' size='sm' onClick={hadleClick}>
					Редагувати
				</Button>
				<Button
					variant={isActive ? 'accent' : 'success'}
					size='sm'
					onClick={handleActivate}
				>
					{isActive ? 'На паузу' : 'Активувати'}
				</Button>
			</div>
		</Card>
	)
}

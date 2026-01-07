import { Service } from '@/types'
import type { ServiceWithRelations } from '@/services/service/serviceTypes'
import { Card } from '../ui/card'
import Image from 'next/image'
import { formatPrice } from '@/utils/textFormat'
import { BadgeCheck, MapPin, Star } from 'lucide-react'

interface ServiceCardProps {
	service: Service | ServiceWithRelations
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
	const { name, shortDescription, photos, type, pricingOptions, price } =
		service

	const mainPhoto = photos?.find(photo => photo.isMain)
	const priceText = formatPrice(
		price,
		pricingOptions as Parameters<typeof formatPrice>[1]
	)

	return (
		<Card className='p-0 hover:shadow-lg hover:shadow-primary/20 hover:translate-y-[-5px] transition-all duration-300 group overflow-hidden'>
			<div className='relative aspect-[16/9] overflow-hidden'>
				{mainPhoto ? (
					<Image
						src={mainPhoto.url}
						alt={mainPhoto.alt || name}
						fill
						className='object-cover'
						sizes='320px'
					/>
				) : (
					<div className='w-full h-full bg-accent-gradient-light flex items-center justify-center text-4xl'>
						{type && 'icon' in type
							? (type as { icon?: string | null }).icon
							: null}
					</div>
				)}
			</div>

			<div className='flex flex-col flex-grow p-4'>
				<h3 className='text-lg font-semibold text-gray-900'>{name}</h3>
				{/* {duration && (
					<div className='flex items-center gap-1 text-sm text-secondary'>
						<Clock className='size-3.5' />
						{formatDuration(duration)}
					</div>
				)} */}

				<div className='flex items-center gap-1'>
					<div className='text-sm text-yellow-500 flex font-bold items-center gap-1'>
						<Star fill='currentColor' className='size-4' /> 4.9
					</div>
					<span className='text-sm text-muted-foreground'>(45 відгуків)</span>
					<div
						className='flex items-center text-indigo-600 ml-auto gap-0.5'
						title='Перевірений виконавець'
					>
						<BadgeCheck className='size-4' />
						<span className='text-[11px] font-bold uppercase tracking-tight'>
							Перевірений
						</span>
					</div>
				</div>

				{/* <div className='flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group/provider'>
					<AvatarCompany provider={provider} />
				</div> */}

				<div className='flex items-center justify-between gap-2 text-slate-500 text-[13px] mb-5'>
					<div className='flex items-center truncate'>
						<MapPin size={14} className='mr-1 shrink-0 text-slate-400' />
						{/* <span className='truncate'>{service.}</span> */}
					</div>
				</div>
			</div>
			{shortDescription && (
				<p className='text-secondary-foreground text-sm'>{shortDescription}</p>
			)}
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<div className='text-lg font-semibold'>{priceText}</div>
			</div>
		</Card>
	)
}

import { Skeleton } from './skeleton'

interface SkeletonProps {
	className?: string
	children?: React.ReactNode
	count?: number
}

export const SkeletonSectionHeader = () => {
	return (
		<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
			<div className='space-y-2'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-4 w-64' />
			</div>
		</div>
	)
}

export const SkeletonInput = () => {
	return (
		<div className='space-y-2'>
			<Skeleton className='h-4 w-20' />
			<Skeleton className='h-12 w-full' />
		</div>
	)
}

export const SkeletonForm = ({ count }: SkeletonProps) => {
	return (
		<div className='space-y-6'>
			{Array.from({ length: count ?? 1 }).map((_, index) => (
				<div key={index} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<SkeletonInput />
					<SkeletonInput />
				</div>
			))}
			<Skeleton className='h-12 w-44' />
		</div>
	)
}

export const SkeletonProfileHero = () => {
	return (
		<div className='flex items-center mb-6 bg-light-gradient gap-4 border-l-4 border-primary rounded-lg p-4'>
			{/* Avatar skeleton */}
			<Skeleton className='w-20 h-20 rounded-full' />

			<div className='flex-1 space-y-4'>
				{/* Name skeleton */}
				<Skeleton className='h-9 w-48' />

				{/* Badges skeleton */}
				<div className='flex items-center gap-2 flex-wrap'>
					<Skeleton className='h-6 w-24' />
					<Skeleton className='h-6 w-40' />
					<Skeleton className='h-6 w-36' />
				</div>
			</div>
		</div>
	)
}

export const SkeletonStatCard = () => {
	return (
		<div className='bg-white border border-gray-200 rounded-lg p-4'>
			{/* Icon and title skeleton */}
			<div className='flex items-center gap-2 mb-2'>
				<Skeleton className='w-5 h-5 rounded' />
				<Skeleton className='h-4 w-20' />
			</div>
			{/* Value skeleton */}
			<Skeleton className='h-8 w-16 mb-2' />
			{/* Subtitle skeleton */}
			<Skeleton className='h-4 w-24' />
		</div>
	)
}

export const SkeletonStatsGrid = ({ count = 2 }: { count?: number }) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
			{Array.from({ length: count }).map((_, index) => (
				<SkeletonStatCard key={index} />
			))}
		</div>
	)
}

interface SkeletonTableProps {
	columns?: number
	rows?: number
	showHeader?: boolean
}

export const SkeletonTable = ({
	columns = 5,
	rows = 5,
	showHeader = true,
}: SkeletonTableProps) => {
	return (
		<div className='relative w-full overflow-x-auto'>
			<table className='w-full caption-bottom text-sm'>
				{showHeader && (
					<thead>
						<tr className='border-b'>
							{Array.from({ length: columns }).map((_, index) => (
								<th
									key={index}
									className='h-10 p-3 text-left align-middle font-medium whitespace-nowrap bg-background'
								>
									<Skeleton className='h-4 w-24' />
								</th>
							))}
						</tr>
					</thead>
				)}
				<tbody>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<tr
							key={rowIndex}
							className='border-b hover:bg-muted/50 transition-colors'
						>
							{Array.from({ length: columns }).map((_, colIndex) => (
								<td
									key={colIndex}
									className='p-3 align-middle whitespace-nowrap'
								>
									{colIndex === 0 ? (
										// Первая колонка - может быть изображение или другой контент
										<div className='flex items-center gap-3'>
											<Skeleton className='h-16 w-16 rounded-lg' />
											<div className='space-y-2 flex-1'>
												<Skeleton className='h-4 w-32' />
												<Skeleton className='h-3 w-48' />
											</div>
										</div>
									) : (
										<Skeleton className='h-4 w-20' />
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export const SkeletonServiceCard = () => {
	return (
		<div className='p-4 hover:shadow-md transition-shadow'>
			{/* Service Header */}
			<div className='flex justify-between items-start mb-3'>
				{/* Image */}
				<Skeleton className='w-24 h-24 rounded-lg flex-shrink-0 mr-3' />
				<div className='flex-1'>
					{/* Title */}
					<Skeleton className='h-6 w-3/4 mb-2' />
					{/* Meta info */}
					<div className='flex items-center gap-3 flex-wrap'>
						<Skeleton className='h-4 w-32' />
						<Skeleton className='h-5 w-20 rounded-full' />
					</div>
				</div>
				{/* Price */}
				<Skeleton className='h-6 w-20 ml-4' />
			</div>
			{/* Description */}
			<div className='mb-4 space-y-2'>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-5/6' />
			</div>
			{/* Actions */}
			<div className='flex gap-2'>
				<Skeleton className='h-8 flex-1 rounded-md' />
			</div>
		</div>
	)
}

interface SkeletonServicesGridProps {
	count?: number
}

export const SkeletonServicesGrid = ({
	count = 6,
}: SkeletonServicesGridProps) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{Array.from({ length: count }).map((_, index) => (
				<SkeletonServiceCard key={index} />
			))}
		</div>
	)
}

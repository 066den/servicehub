import { Skeleton } from '../skeleton'

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

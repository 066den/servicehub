'use client'
import { ReactNode } from 'react'
import Portal from './Portal'
import { Button } from '../ui/button'
import { NoneToVoidFunction } from '@/@types/global'
import { overlayVariants, modalVariants } from '../ui/animate/variants'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { X } from 'lucide-react'

type Props = {
	children: ReactNode
	title: string
	subtitle?: string
	isOpen: boolean
	header?: ReactNode
	footer?: ReactNode
	onClose?: NoneToVoidFunction
	className?: string
	headerColor?: 'default' | 'primary'
	position?: 'center' | 'top'
	size?: 'sm' | 'md' | 'lg'
}

const Modal = ({
	children,
	title,
	subtitle,
	isOpen,
	header,
	footer,
	onClose,
	className,
	headerColor = 'default',
	position = 'center',
	size = 'md',
}: Props) => {
	useBodyScrollLock(isOpen)

	function renderHeader() {
		if (header || title) {
			return (
				<div
					className={cn('px-8 py-4', className, {
						'border-b border-gray-100': headerColor === 'default',
						'bg-primary text-white': headerColor === 'primary',
					})}
				>
					{header}
					{title && (
						<div className='text-xl font-semibold text-gray-800'>{title}</div>
					)}
					{subtitle && <div className='text-gray-600 mt-1'>{subtitle}</div>}
				</div>
			)
		}
	}

	return (
		<Portal>
			<AnimatePresence>
				{isOpen && (
					<div
						className={cn(
							'fixed inset-0 z-[150] py-4 px-2 flex justify-center items-center',
							{ 'items-start': position === 'top' }
						)}
						role='dialog'
						aria-modal='true'
						tabIndex={-1}
					>
						<motion.div
							onClick={onClose}
							className='fixed inset-0 bg-black/50 backdrop-blur-sm -z-10'
							variants={overlayVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
						/>
						<motion.div
							variants={modalVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
							className={cn(
								'relative flex flex-col bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-hidden',
								{
									'max-w-[26rem]': size === 'sm',
									'max-w-[31.25rem]': size === 'md',
									'max-w-[56.25rem]': size === 'lg',
								}
							)}
						>
							<Button
								variant='ghost'
								size='round'
								withoutTransform
								aria-label='Close'
								onClick={onClose}
								className='absolute top-3 right-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100'
							>
								<X size={20} />
							</Button>
							{renderHeader()}
							<div className='px-8 py-6 flex-1 overflow-y-auto'>
								{children}
								{footer && <div className='pt-7'>{footer}</div>}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</Portal>
	)
}

export default Modal

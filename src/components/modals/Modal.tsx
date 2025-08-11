'use client'
import { ReactNode } from 'react'
import Portal from './Portal'
import Button from '../ui/Button'
import IconSvg from '../ui/IconSvg'
import { NoneToVoidFunction } from '@/@types/global'
import { overlayVariants, modalVariants } from '../ui/animate/variants'
import { AnimatePresence, motion } from 'motion/react'
import classNames from 'classnames'

import './Modal.scss'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

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
}: Props) => {
	useBodyScrollLock(isOpen)

	function renderHeader() {
		if (header || title) {
			return (
				<div
					className={classNames(
						'modal-header',
						className,
						`header-${headerColor}`
					)}
				>
					{header}
					{title && <div className='modal-title'>{title}</div>}
					{subtitle && <div className='modal-subtitle'>{subtitle}</div>}
				</div>
			)
		}
	}

	return (
		<Portal>
			<AnimatePresence>
				{isOpen && (
					<div
						className={classNames('modal', `modal-${position}`)}
						role='dialog'
						aria-modal='true'
						tabIndex={-1}
					>
						<motion.div
							onClick={onClose}
							className='modal-overlay'
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
							className='modal-content'
						>
							<Button
								round
								color='translucent'
								size='sm'
								ariaLabel='Close'
								className='modal-close'
								onClick={onClose}
							>
								<IconSvg name='close' />
							</Button>
							{renderHeader()}
							<div className='modal-body'>
								{children}
								{footer && (
									<div className='modal-actions-container'>{footer}</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</Portal>
	)
}

export default Modal

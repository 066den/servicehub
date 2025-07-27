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

type Props = {
	children: ReactNode
	title: string
	subtitle?: string
	isOpen: boolean
	header?: ReactNode
	onClose?: NoneToVoidFunction
	className?: string
	headerColor?: 'default' | 'primary'
}

const Modal = ({
	children,
	title,
	subtitle,
	isOpen,
	header,
	onClose,
	className,
	headerColor = 'default',
}: Props) => {
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
					<>
						<motion.div
							className='modal-overlay'
							variants={overlayVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
						/>
						<motion.div
							onClick={onClose}
							className='modal'
							role='dialog'
							aria-modal='true'
							tabIndex={-1}
							variants={modalVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
						>
							<div className='modal-content'>
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
								<div className='modal-body'>{children}</div>
								<div className='modal-footer'></div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</Portal>
	)
}

export default Modal

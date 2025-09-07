import { Button } from '../ui/button'
import Modal from './Modal'

type Props = {
	title: string
	text?: string
	isOpen: boolean
	onClose: () => void
	onConfirm?: () => void
	onDestroy?: () => void
	onCancel?: () => void

	confirmText?: string
	cancelText?: string
	destroyText?: string
}

const ConfirmDialog = ({
	title,
	text,
	isOpen,
	onClose,
	onConfirm,
	onDestroy,
	onCancel,
	confirmText = 'OK',
	cancelText = 'Скасувати',
	destroyText = 'Вилучити',
}: Props) => {
	const handleConfirm = () => {
		onConfirm?.()
		onClose()
	}

	const handleDestroy = () => {
		onDestroy?.()
		onClose()
	}

	const modalActions = (
		<div className='flex flex-col gap-2'>
			{onConfirm && (
				<Button size='md' onClick={handleConfirm}>
					{confirmText}
				</Button>
			)}

			{onDestroy && (
				<Button size='md' variant='outline-destructive' onClick={handleDestroy}>
					{destroyText}
				</Button>
			)}

			{onCancel && (
				<Button size='md' variant='outline-primary' onClick={onCancel}>
					{cancelText}
				</Button>
			)}
		</div>
	)

	return (
		<Modal
			size='sm'
			title={title}
			isOpen={isOpen}
			footer={modalActions}
			onClose={onClose}
		>
			<p className='text-center'>{text}</p>
		</Modal>
	)
}

export default ConfirmDialog

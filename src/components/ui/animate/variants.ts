import { Variants } from 'framer-motion'

export const notificationVariants = {
	hidden: { opacity: 0, x: -20, scale: 0.8 },
	visible: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			type: 'spring' as const,
			stiffness: 400,
			damping: 25,
		},
	},
}

export const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const shakeVariants = {
	light: {
		x: [0, -5, 5, -5, 5, 0],
		transition: { duration: 0.4 },
	},
	medium: {
		x: [0, -10, 10, -10, 10, 0],
		transition: { duration: 0.5 },
	},
	strong: {
		x: [0, -20, 20, -20, 20, 0],
		transition: { duration: 0.6 },
	},
	earthquake: {
		x: [0, -30, 25, -20, 15, -10, 5, 0],
		y: [0, -10, 8, -6, 4, -2, 0],
		transition: { duration: 0.8 },
	},
	static: {
		x: 0,
	},
}

export const bounceVariants: Variants = {
	bounce: {
		y: [0, 0, -5, 0, -3, 0, 0],
		transition: {
			duration: 1,
			times: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1],
			ease: 'easeOut',
			repeat: Infinity, // Если нужно повторение
		},
	},
	static: {
		y: 0,
	},
}

export const headerVariants: Variants = {
	hidden: {
		y: -100,
		opacity: 0,
	},
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 30,
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
}

export const overlayVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
	exit: { opacity: 0 },
}

export const modalVariants: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
		y: 50,
	},
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 30,
			staggerChildren: 0.1,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		y: 50,
		transition: {
			duration: 0.2,
		},
	},
}

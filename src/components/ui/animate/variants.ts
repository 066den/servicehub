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

export const systemNotificationVariants: Variants = {
	hidden: { opacity: 0, x: '100%' },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
	},
	exit: {
		opacity: 0,
		x: '100%',
	},
}

export const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export const heroContainerVariants = {
	hidden: {},
	visible: {
		transition: {
			duration: 0.6,
			staggerChildren: 0.2,
		},
	},
}

export const heroImageVariants = {
	hidden: { opacity: 0, scale: 1.1 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.8,
			ease: [0.4, 0, 0.2, 1] as const,
		},
	},
}

export const heroContentVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.4, 0, 0.2, 1] as const,
		},
	},
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
			repeat: Infinity,
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
	visible: {
		opacity: 1,
		transition: {
			duration: 0.1,
			ease: 'easeOut',
		},
	},
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

export const confirmVariants: Variants = {
	hidden: { scale: 0.9, opacity: 0 },
	visible: { scale: 1, opacity: 1 },
	exit: { scale: 1.1, opacity: 0 },
}

export const dropdownVariants: Variants = {
	closed: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
			when: 'afterChildren',
		},
	},
	open: {
		opacity: 1,
		height: 'auto',
		transition: {
			duration: 0.3,
			ease: 'easeOut',
			when: 'beforeChildren',
			staggerChildren: 0.05,
		},
	},
}

export const progressFillVariants: Variants = {
	hidden: {
		width: '0%',
	},
	visible: {
		width: '100%',
	},
}

export const fadeScaleVariants: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.15, ease: 'easeOut' },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: { duration: 0.15, ease: 'easeOut' },
	},
}

export const sloganVariants: Variants = {
	initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
	animate: {
		opacity: 1,
		y: 0,
		filter: 'blur(0px)',
		transition: {
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		filter: 'blur(2px)',
		transition: {
			ease: 'easeIn',
		},
	},
}

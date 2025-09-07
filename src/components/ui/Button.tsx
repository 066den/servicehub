import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:shadow-xs",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-xs hover:bg-primary-dark hover:shadow-[0_8px_25px_hsl(var(--color-primary-shadow))]',
				destructive:
					'bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-[0_8px_25px_hsl(var(--color-default-shadow))] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				accent:
					'bg-accent text-accent-foreground shadow-xs hover:bg-accent-dark hover:shadow-[0_8px_25px_hsl(var(--color-accent-shadow))]',
				success:
					'bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)]',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-sm dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				'outline-primary':
					'border-2 border-primary bg-background text-primary shadow-xs hover:bg-primary/10 hover:shadow-[0_2px_8px_hsl(var(--color-primary-shadow))]',
				'outline-accent':
					'border-2 border-accent bg-background text-accent shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-[0_8px_25px_hsl(var(--color-accent-shadow))]',
				'outline-destructive':
					'border-2 border-destructive bg-background text-destructive shadow-xs hover:bg-destructive/10 hover:shadow-[0_2px_8px_hsl(var(--color-default-shadow))]',
				'outline-secondary':
					'border-2 border-border bg-background text-secondary-foreground shadow-xs hover:bg-secondary hover:text-secondary-foreground hover:shadow-sm dark:bg-input/30 dark:border-input',
				secondary:
					'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:shadow-sm',
				ghost:
					'text-secondary-foreground hover:bg-muted dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline hover:translate-y-0 hover:shadow-none',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 hover:translate-y-0 hover:shadow-none',
				lg: 'rounded-md text-lg px-6 py-3 has-[>svg]:px-4',
				icon: 'size-9 hover:translate-y-0 hover:shadow-none',
				md: 'h-11 px-5 py-2 has-[>svg]:px-3',
				round: 'size-10 rounded-full p-0 hover:translate-y-0 hover:shadow-none',
			},
			withoutTransform: {
				true: 'hover:translate-none hover:shadow-none',
				false: '',
			},
			fullWidth: {
				true: 'w-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

function Button({
	className,
	variant,
	size,
	withoutTransform = false,
	asChild = false,
	fullWidth = false,
	loading = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
		withoutTransform?: boolean
		fullWidth?: boolean
		loading?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot='button'
			className={cn(
				buttonVariants({
					variant,
					size,
					withoutTransform,
					fullWidth,
					className,
				})
			)}
			disabled={loading || props.disabled}
			{...props}
		>
			{loading ? (
				size === 'round' ? (
					<div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
				) : (
					'⏳ Обробка...'
				)
			) : (
				props.children
			)}
		</Comp>
	)
}

export { Button, buttonVariants }


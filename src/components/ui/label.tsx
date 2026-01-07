'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

function Label({
	className,
	required,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
	return (
		<LabelPrimitive.Root
			data-slot='label'
			className={cn(
				'text-base font-semibold text-gray-700 leading-none select-none',
				'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
				'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
				required && 'after:content-["*"] after:text-destructive after:ml-1',
				className
			)}
			{...props}
		/>
	)
}

export { Label }


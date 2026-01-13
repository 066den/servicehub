import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				'flex min-h-[100px] w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-normal text-gray-900 placeholder:text-gray-500 transition-all duration-300 ease resize-vertical',
				'focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100',
				'hover:border-gray-300',
				'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
				className
			)}
			{...props}
		/>
	)
}

export { Textarea }


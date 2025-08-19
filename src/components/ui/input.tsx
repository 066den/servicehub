import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(
				'flex h-13 w-full rounded-lg border-2 border-gray-200 bg-input px-4 py-3 text-base font-normal text-gray-900 placeholder:text-gray-500 transition-all duration-300 ease',
				'focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100',
				'hover:border-gray-300',
				'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
				'file:border-0 file:bg-transparent file:text-sm file:font-medium',
				className
			)}
			{...props}
		/>
	)
}

export { Input }


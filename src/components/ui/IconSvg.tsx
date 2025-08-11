import { memo, useMemo } from 'react'

export interface IIconSvg {
	name: string
	w?: string
	h?: string
	color?: string
	fill?: string
	stroke?: string
	className?: string
	id?: string
}

const IconSvg = ({ name, w, h }: IIconSvg) => {
	const renderIcon = useMemo(() => {
		switch (name) {
			case 'close':
				return (
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width={w || 24}
						height={h || 24}
						fill='none'
						viewBox='0 0 24 24'
					>
						<path
							stroke='#929298'
							strokeLinecap='round'
							strokeWidth='1.5'
							d='M17.781 17.968 6.594 6.781m0 11.187L17.78 6.781'
						/>
					</svg>
				)

			default:
				return null
		}
	}, [name, w, h])

	return <i className='icon-svg'>{renderIcon}</i>
}

export default memo(IconSvg)

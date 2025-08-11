'use client'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
	children: ReactNode
}

export default function Modal({ children }: Props) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	const portalRoot = document.getElementById('portal_root')
	if (!portalRoot) return null

	return createPortal(children, portalRoot)
}

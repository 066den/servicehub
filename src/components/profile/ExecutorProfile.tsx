'use client'

import { useProvider } from '@/hooks/storeHooks/useProvider'
import ExecutorRegister from './ExecutorRegister'

const ExecutorProfile = () => {
	const { provider } = useProvider()
	if (!provider) {
		return <ExecutorRegister />
	}
	return <div>ExecutorProfile</div>
}

export default ExecutorProfile

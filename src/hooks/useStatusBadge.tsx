import { Badge } from '@/components/ui/badge'

export const useStatusBadge = () => {
	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'FREE':
				return <Badge variant='success'>Вільний</Badge>
			case 'BUSY':
				return <Badge variant='destructive'>Зайнятий</Badge>
			case 'ON_VACATION':
				return <Badge variant='outline'>У відпустці</Badge>
			case 'INACTIVE':
				return <Badge variant='secondary'>Неактивний</Badge>
			default:
				return <Badge variant='outline'>{status}</Badge>
		}
	}

	return { getStatusBadge }
}

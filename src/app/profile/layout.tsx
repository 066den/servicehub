import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import Sidebar from '@/components/common/Sidebar'
import { Card } from '@/components/ui/card'

export default function UserLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div>
			<Header />
			<div className='container'>
				<div className='grid grid-cols-[17.5rem_1fr] gap-6 py-6'>
					<Sidebar />
					<Card>{children}</Card>
				</div>
			</div>
			<Footer />
		</div>
	)
}

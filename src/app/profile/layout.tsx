import HeaderWithCategories from '@/components/main/HeaderWithCategories'
import Footer from '@/components/main/Footer'
import SidebarProfile from '@/components/common/SidebarProfile'
import { Card } from '@/components/ui/card'

export default function UserLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div>
			<HeaderWithCategories />
			<div className='container'>
				<div className='grid grid-cols-[17.5rem_1fr] gap-6 py-6'>
					<SidebarProfile />
					<Card>{children}</Card>
				</div>
			</div>
			<Footer />
		</div>
	)
}

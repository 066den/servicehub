import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import Sidebar from '@/components/main/Sidebar'
import ProfileHero from '@/components/main/ProfileHero'

export default function UserLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div>
			<Header />
			<ProfileHero />
			<div className='container'>
				<div className='dashboard-layout'>
					<Sidebar />
					{children}
				</div>
			</div>
			<Footer />
		</div>
	)
}

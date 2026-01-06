import HeaderWithCategories from '@/components/main/HeaderWithCategories'
import Footer from '@/components/main/Footer'

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='flex flex-col min-h-screen'>
			<HeaderWithCategories />
			<main className='flex-1'>{children}</main>
			<Footer />
		</div>
	)
}

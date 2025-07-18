import Footer from '@/components/main/Footer'
import Header from '@/components/main/Header'

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<main className='main'>
			<Header />
			{children}
			<Footer />
		</main>
	)
}

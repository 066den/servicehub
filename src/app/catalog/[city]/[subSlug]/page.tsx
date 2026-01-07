import { ServiceListPuplic } from '@/components/services/ServiceListPuplic'
import { getServicesFromDB } from '@/services/service/serviceServices'

const SubcategoryServicesPage = async ({
	params,
}: {
	params: Promise<{ city: string; subSlug: string }>
}) => {
	const { city, subSlug } = await params

	const initialServicesList = await getServicesFromDB({
		city: decodeURIComponent(city),
		subcategorySlug: decodeURIComponent(subSlug),
		page: 1,
		limit: 20,
	})

	return (
		<section>
			<ServiceListPuplic
				city={city}
				subSlug={subSlug}
				initialServicesList={initialServicesList}
			/>
		</section>
	)
}

export default SubcategoryServicesPage

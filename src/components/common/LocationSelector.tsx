import Modal from '../modals/Modal'
import Button from '../ui/Button'
import PlacesAutocomplete from '../ui/inputs/PlacesAutocomplete'

const LocationSelector = () => {
	return (
		<>
			<Button className='location-selector'>
				<span className='location-icon'>📍</span>
				<span className='location-city'>Білгород-Дністровський</span>
			</Button>
			<Modal
				title='Виберіть ваше місцезнаходження'
				subtitle='Це допоможе знайти виконавців поблизу'
				headerColor='primary'
				isOpen={true}
				onClose={() => {}}
			>
				<PlacesAutocomplete />
			</Modal>
		</>
	)
}

export default LocationSelector

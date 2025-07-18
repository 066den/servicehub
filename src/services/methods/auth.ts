import axios from 'axios'

export const sendCode = async (phone: string) => {
	const response = await axios.post('/api/auth', { phone })
	return response.data
}

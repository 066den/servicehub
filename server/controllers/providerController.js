class ProviderController {
	async create(req, res) {
		const { name, description, categoryId, typeId } = req.body
	}

	async getAll(req, res) {
		const providers = await Provider.findAll()
		res.json(providers)
	}

	async getOne(req, res) {
		const { id } = req.params
		const provider = await Provider.findByPk(id)
		res.json(provider)
	}

	async update(req, res) {
		const { id } = req.params
		const provider = await Provider.findByPk(id)
		if (!provider) {
			return res.status(404).json({ message: 'Provider not found' })
		}
		await provider.update(req.body)
		res.json(provider)
	}

	async delete(req, res) {
		const { id } = req.params
		const provider = await Provider.findByPk(id)
		if (!provider) {
			return res.status(404).json({ message: 'Provider not found' })
		}
		await provider.destroy()
		res.json({ message: 'Provider deleted' })
	}
}

module.exports = new ProviderController()

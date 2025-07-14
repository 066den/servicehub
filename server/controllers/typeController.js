class TypeController {
	async create(req, res) {
		const { name } = req.body
	}
	async getAll(req, res) {
		const types = await Type.findAll()
		return res.json(types)
	}
	async getOne(req, res) {
		const { id } = req.params
		const type = await Type.findOne({ where: { id } })
		return res.json(type)
	}
	async update(req, res) {
		const { id } = req.params
		const { name } = req.body
		const type = await Type.findOne({ where: { id } })
		type.name = name
		await type.save()
		return res.json(type)
	}
	async delete(req, res) {
		const { id } = req.params
		const type = await Type.findOne({ where: { id } })
		await type.destroy()
		return res.json({ message: 'Type deleted' })
	}
}

module.exports = new TypeController()

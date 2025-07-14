const { Category } = require('../models/models')

class CategoryController {
	async create(req, res) {
		const { name } = req.body
		const category = await Category.create({ name })
		return res.json(category)
	}

	async getAll(req, res) {
		const categories = await Category.findAll()
		res.json(categories)
	}

	async getOne(req, res) {
		const { id } = req.params
		const category = await Category.findByPk(id)
		res.json(category)
	}

	async update(req, res) {
		const { id } = req.params
		const category = await Category.findByPk(id)
		if (!category) {
			return res.status(404).json({ message: 'Category not found' })
		}
		await category.update(req.body)
		res.json(category)
	}

	async delete(req, res) {
		const { id } = req.params
		const category = await Category.findByPk(id)
		if (!category) {
			return res.status(404).json({ message: 'Category not found' })
		}
		await category.destroy()
		res.json({ message: 'Category deleted' })
	}
}

module.exports = new CategoryController()

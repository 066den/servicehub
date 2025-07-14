const uuid = require('uuid')
const path = require('path')
const { Service } = require('../models/models')

class ServiceController {
	async create(req, res, next) {
		try {
			const { name, description, categoryId, typeId } = req.body
			const { img } = req.files
			let fileName = uuid.v4() + '.jpg'
			img.mv(path.resolve(__dirname, '..', 'static', fileName))
			const service = await Service.create({
				name,
				description,
				categoryId,
				typeId,
				img: fileName,
			})
			return res.json(service)
		} catch (error) {
			next(ApiError.badRequest(error.message))
		}
	}

	async getAll(req, res) {
		let { categoryId, typeId, limit, page } = req.query
		page = page || 1
		limit = limit || 9
		let offset = page * limit - limit
		let services

		if (!categoryId && !typeId) {
			services = await Service.findAndCountAll({
				limit,
				offset,
			})
		} else if (categoryId && !typeId) {
			services = await Service.findAndCountAll({
				where: { categoryId },
				limit,
				offset,
			})
		} else if (!categoryId && typeId) {
			services = await Service.findAndCountAll({
				where: { typeId },
				limit,
				offset,
			})
		} else {
			services = await Service.findAndCountAll({
				where: { categoryId, typeId },
				limit,
				offset,
			})
		}

		return res.json(services)
	}

	async getOne(req, res) {
		const { id } = req.params
		const service = await Service.findOne({
			where: { id },
			include: [
				{ model: Type, as: 'type' },
				{ model: Category, as: 'category' },
				{ model: Provider, as: 'provider' },
			],
		})
		res.json(service)
	}

	async update(req, res) {
		const { id } = req.params
		const service = await Service.findByPk(id)
		if (!service) {
			return res.status(404).json({ message: 'Service not found' })
		}
		await service.update(req.body)
		res.json(service)
	}

	async delete(req, res) {
		const { id } = req.params
		const service = await Service.findByPk(id)
		if (!service) {
			return res.status(404).json({ message: 'Service not found' })
		}
		await service.destroy()
		res.json({ message: 'Service deleted' })
	}
}

module.exports = new ServiceController()

class OrderController {
	async create(req, res) {
		const { name } = req.body
	}
	async getAll(req, res) {
		const orders = await Order.findAll()
		return res.json(orders)
	}
	async getOne(req, res) {
		const { id } = req.params
		const order = await Order.findOne({ where: { id } })
		return res.json(order)
	}
	async update(req, res) {
		const { id } = req.params
		const { name } = req.body
		const order = await Order.findOne({ where: { id } })
		order.name = name
		await order.save()
		return res.json(order)
	}
	async delete(req, res) {
		const { id } = req.params
		const order = await Order.findOne({ where: { id } })
		await order.destroy()
		return res.json({ message: 'Order deleted' })
	}
}

module.exports = new OrderController()

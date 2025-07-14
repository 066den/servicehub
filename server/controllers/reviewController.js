class ReviewController {
	async create(req, res) {
		const { name } = req.body
	}
	async getAll(req, res) {
		const reviews = await Review.findAll()
		return res.json(reviews)
	}
	async getOne(req, res) {
		const { id } = req.params
		const review = await Review.findOne({ where: { id } })
		return res.json(review)
	}
	async update(req, res) {
		const { id } = req.params
		const { name } = req.body
		const review = await Review.findOne({ where: { id } })
		review.name = name
		await review.save()
		return res.json(review)
	}
	async delete(req, res) {
		const { id } = req.params
		const review = await Review.findOne({ where: { id } })
		await review.destroy()
		return res.json({ message: 'Review deleted' })
	}
}

module.exports = new ReviewController()

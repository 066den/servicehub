const Router = require('express')
const router = new Router()
const providerController = require('../controllers/providerController')

router.post('/', providerController.create)
router.get('/', providerController.getAll)
router.get('/:id', providerController.getOne)
router.put('/:id', providerController.update)
router.delete('/:id', providerController.delete)

module.exports = router

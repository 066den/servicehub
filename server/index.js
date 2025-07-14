require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const { User } = require('./models/models')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const path = require('path')

const router = require('./routes')
const errorHandlingMiddleware = require('./middleware/errorHandlingMiddleware')
const languageMiddleware = require('./middleware/lenguageMiddleware')
const turboSmsService = require('./services/turboSmsService')

//test

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use(languageMiddleware)
// Проверка конфигурации TurboSMS при старте
// app.use(turboSmsService.validateConfig)

app.use('/api', router)

app.use(errorHandlingMiddleware)

const start = async () => {
	try {
		app.listen(port, () => console.log(`Server is running on port ${port}`))
		await sequelize.authenticate()
		await sequelize.sync() // alter: true создаёт таблицу после изменения модели
		// Проверка TurboSMS
		await turboSmsService.checkBalance()
	} catch (e) {
		console.log(e)
	}
}

start()

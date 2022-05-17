// Импортируем модули
require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

// Задаем порт
const PORT = process.env.PORT || 5000

// Инициализируем все необходимые модули и само приложение
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

// Middleware идут последними
app.use(errorHandler)

// Функция запуска сервера
const start = async() => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

// Запуск сервера
start()
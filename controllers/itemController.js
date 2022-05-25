const uuid = require('uuid')
const path = require('path')
const {Item, ItemInfo, Rating} = require('../models/models')
const ApiError = require('../error/ApiError')

class ItemController {
    async create(req, res, next) {
        try {
            // Получаем данные из запроса
            let {name, title, price, categoryId, description, region, size} = req.body
            let {images} = req.files
            images = Array.from(images)
            console.log("ДОБАВЛЕНИЕ УСТРОЙСТВА")
            const fileNames = []
            // Работаем с изображениями
            images.map(image => {
                let fileName = uuid.v4() + '.jpg'
                fileNames.push(fileName)
                image.mv(path.resolve(__dirname, '..', 'static', fileName))
            })
            console.log(String(fileNames))
            // Создаем объект базы данных
            const item = await Item.create({
                name,
                title,
                price,
                categoryId,
                img: String(fileNames),
                description,
                region,
                size
            })
            console.log(item)
            // Получаем информацию о товаре из связанной таблицы
            // if (info) {
            //     info = JSON.parse(info)
            //     info.forEach(i =>
            //         ItemInfo.create({
            //             title: i.title,
            //             description: i.description,
            //             itemId: item.id,
            //         })
            //     )
            // }
            // Возвращаем ответ
            return res.json(item)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {categoryId, limit, page} = req.query
        page = page || 1
        limit = limit || 12
        let offset = (page - 1) * limit
        let items;
        if (!categoryId)
            items = await Item.findAndCountAll({limit, offset})
        else {
            items = await Item.findAndCountAll({
                where: {categoryId},
                limit, offset
            })
        }
        return res.json(items)
    }

    async getByID(req, res) {
        const {id} = req.params
        const item = await Item.findOne(
            {
                where: {id}
            }
        )
        return res.json(item)
    }

    async getRating(req, res) {
        let {userId, itemId} = req.body
        console.log(123477)
        const rating = await Rating.findOne({
            where: {userId, itemId}
        })
        return rating ? res.json(rating.rate) : res.json(0)
    }
}

module.exports = new ItemController()
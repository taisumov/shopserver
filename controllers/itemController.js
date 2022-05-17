const uuid = require('uuid')
const path = require('path')
const {Item, ItemInfo} = require('../models/models')
const ApiError = require('../error/ApiError')

class ItemController {
    async create(req, res, next) {
        try {
            // Получаем данные из запроса
            let {name, title, price, categoryId, info} = req.body
            let {images} = req.files
            images = Array.from(images)
            console.log(images, name)
            const fileNames = []
            // Работаем с изображениями
            images.map(image => {
                let fileName = uuid.v4() + '.jpg'
                fileNames.push(fileName)
                image.mv(path.resolve(__dirname, '..', 'static', fileName))
            })
            // Создаем объект базы данных
            const item = await Item.create({name, title, price, categoryId, img: String(fileNames)})
            // Получаем информацию о товаре из связанной таблицы
            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    ItemInfo.create({
                        title: i.title,
                        description: i.description,
                        itemId: item.id,
                    })
                )
            }
            // Возвращаем ответ
            return res.json(item)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {categoryId, limit, page} = req.query
        page = page || 1
        limit = limit || 10
        let offset = (page - 1) * limit
        let items;
        if (!categoryId)
            items = await Item.findAndCountAll()
        else {
            items = await Item.findAndCountAll({
                where: {categoryId}, limit, offset
            })
        }
        return res.json(items)
    }

    async getByID(req, res) {
        const {id} = req.params
        console.log(id + ' СОСАТЬ')
        const item = await Item.findOne(
            {
                where: {id},
                // include: [{model: ItemInfo, as: 'info'}],
            },
        )
        return res.json(item)
    }
}

module.exports = new ItemController()
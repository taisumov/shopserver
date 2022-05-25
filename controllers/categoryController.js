const {Category} = require('../models/models')
const ApiError = require('../error/ApiError')

class CategoryController{
    async create(req, res){
        const {name} = req.body
        const category = await Category.create({name})
        return res.json(category)
    }

    async getAll(req, res){
        const categories = await Category.findAll()
        return res.json(categories)
    }

    async getByID(req, res){
        const {id} = req.params
        const category = await Category.findOne({where: id})
        return res.json(category)
    }

    async deleting(req, res){
        console.log('УДАЛЕНИЕ КАТЕГОРИИ!')
        const {id} = req.body
        await Category.destroy({where: {id}}).then(
            (data) => console.log(`Удалена категория (${data})`)
        )
        return res.json(`Удалена категория с ID: ${id}`)
    }
}

module.exports = new CategoryController()
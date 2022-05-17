const ApiError = require('../error/ApiError')
const {User} = require("../models/models");

class AdminController {
    async getUsers(req, res) {
        const users = await User.findAll()
        return res.json(users)
    }

    async deleteUser(req, res) {
        const {email} = req.body
        await User.destroy({where: {email}})
        return res.json(`User with email: ${email} was deleted!`)
    }
}

module.exports = new AdminController()
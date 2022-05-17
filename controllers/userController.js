const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket} = require('../models/models')
const uuid = require("uuid");
const path = require("path");

const generateJwt = (id, email, role, avatar, name, surname) => {
    return jwt.sign(
        {id, email, role, avatar, name, surname},
        process.env.SECRET_KEY,
        {expiresIn: '24h'},
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role} = req.body
        const avatar = null,
              name = null,
              surname = null

        if (!email || !password)
            return next(ApiError.badRequest('Некорректная почта или пароль!'))

        const candidate = await User.findOne({where: {email}})

        if (candidate)
            return next(ApiError.badRequest('Пользователь с такой почтой уже существует!'))

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({
            email,
            role,
            password: hashPassword
        })

        const basket = await Basket.create({userId: user.id})

        const token = generateJwt(user.id, user.email, user.role, avatar, name, surname)

        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})

        if (!user)
            return next(ApiError.internal('Пользователь не найден!'))

        let comparePassword = bcrypt.compareSync(password, user.password)

        if (!comparePassword)
            return next(ApiError.internal('Указан неверный пароль!'))

        const token = generateJwt(
            user.id,
            user.email,
            user.role,
            user.avatar,
            user.name,
            user.surname
        )
        return res.json({token})
    }

    async isAuth(req, res, next) {
        let user = await User.findOne({where: {email: req.user.email}})
        const token = generateJwt(
            user.id,
            user.email,
            user.role,
            user.avatar,
            user.name,
            user.surname
        )
        return res.json({token})
    }

    async update(req, res, next) {
        const {eMail, newEmail, newName, newSurname} = req.body
        const user = await User.findOne({where: {email: eMail}})
        if (!user) {
            return next(ApiError.badRequest('Ошибка при обновлении пользователя!'))
        }

        let avatarUpdate //const
        let fileName
        let compareUser


        if(req.files) {
            avatarUpdate = req.files.avatarUpdate
            fileName = uuid.v4() + '.jpg'
            await avatarUpdate.mv(path.resolve(__dirname, '..', 'static', fileName))

            compareUser = await User.findOne({where: {email: eMail}})

            if (compareUser.id !== user.id)
                return next(ApiError.badRequest('Пользователь с такой почтой уже существует!'))

            if (avatarUpdate) {
                await User.update({
                    avatar: String(fileName)
                }, {where: {email: eMail}})
            }
        }

        await User.update({
            email: newEmail,
            name: newName,
            surname: newSurname,
            //avatar: String(fileName)
        }, {where: {email: eMail}})

        const updatedUser = User.findOne({where: {email: newEmail}})

        const token = generateJwt(
            updatedUser.id,
            updatedUser.email,
            updatedUser.role,
            updatedUser.avatar,
            updatedUser.name,
            updatedUser.surname
        )

        return res.json({token})
    }
}

module.exports = new UserController()
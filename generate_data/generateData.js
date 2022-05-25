const sequelize = require('../db')
const slug = require("slug");
const bcrypt = require('bcrypt')
const Chance = require("chance")
const fs = require("fs");

const chance = new Chance()
const rand = (min, max) => Math.random() * (max - min) + min

//Максимум не включается, минимум включается
const getRandomInt = (min, max) => Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + min

// Данные для генерации товаров
const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,' +
    'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const regions = ['Кения', 'Эквадор', 'Украина', 'Италия', 'Беларусь', 'Испания']

const {User, Basket, Item, Category, Rating} = require('../models/models')


// Добавление категории в БД
const genCategory = async (name) => {
    await Category.create({name})
}

// Добавление товара в БД
const genItem = async (name, price, categoryId, region, size) => {
    const title = slug(name)
    await Item.create({name, title, price, categoryId, description: text, region, size})
}

// Генерация пользователя
const genUser = async (email, password, name, surname) => {
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({
        email,
        name,
        surname,
        role: 'USER',
        password: hashPassword
    })
    const basket = await Basket.create({userId: user.id})
}

// Генерация рейтинга
const genRating = async (userId, itemId, rate) => {
    let item
    await Rating.create({
        userId, itemId, rate, is_read: !!rate
    })
    item = await Item.findOne({where: {id: itemId}}).then(async (item) => {
        await Item.update({
            counter_rating: item.counter_rating + 1,
            rating: (item.rating + item.counter_rating) / (item.counter_rating + 1),
        }, {where: {id: itemId}})
    })
}

// Генерация почты
const createUserEmail = () => {
    return chance.email()
}

// Генерация имени
const createUserName = () => {
    return chance.name().split(' ')[0]
}

// Генерация фамилии
const createUserSurname = () => {
    return chance.name().split(' ')[1]
}

//Генерация таблицы пользователей
const genUsers = (number) => {
    for (let i = 0; i < number; i++) {
        genUser(
            createUserEmail(),
            '12345678',
            createUserName(),
            createUserSurname()
        ).then(() => console.log(`Пользователь №${i} - успешно!`))
    }
}

//Генерация названий для товаров (подгрузка из файла)
const getJsonItemsName = () => {
    let json = require('/Users/taisumov/PycharmProjects/parser/data_file1.json');
    let result = []
    for (let i in json) {
        result.push(json[i])
    }
    return result
}

//Генерация таблицы товаров
const genItemsList = () => {
    const items = getJsonItemsName()
    for (let i = 1; i < items.length; i++) {
        genItem(
            items[i],
            getRandomInt(1000, 2000),
            getRandomInt(1, 10),
            regions[getRandomInt(0, regions.length)],
            `${getRandomInt(30, 80)}x${getRandomInt(30, 80)}`
        ).then(() => console.log(`Товар №${i} - успешно!`)).catch(e => console.log(e))
    }
}

//Генерация категорий
const genCategoriesList = (number) => {
    for (let i = 0; i < number; i++) {
        genCategory(`Категория ${i}`).then(() => console.log(`Категория №${i} - успешно!`))
    }
}

// Генерация массива оценок (разреженная матрица)
const genArrayRatings = (number) => {
    let rates = []
    //Генерируем индексы для ненулевых оценок
    let randIndexes = new Set()
    for (let i = 0; i < getRandomInt(5, Math.floor(number / 7)); i++)
        randIndexes.add(getRandomInt(0, number + 1))
    //Генерируем оценки для выбранных ненулевых позиций
    for (let i = 0; i < number; i++)
        rates[i] = randIndexes.has(i) ? getRandomInt(3, 6) : 0
    return rates
}

// Генерация таблицы оценок
const genRatingsList = async () => {
    const users = await User.findAll()
    const items = await Item.findAll()
    for (let user of users) {
        let rateArray = genArrayRatings(items.length)
        for (let i = 0; i < items.length; i++) {
            if (!!rateArray[i]) {
                //await genRating(user.id, items[i].id, rateArray[i])
                await Rating.create({
                    is_read: !!rateArray[i],
                    rate: rateArray[i],
                    userId: user.id,
                    itemId: items[i].id
                })
            }
        }
    }
}

const updateAvgRatings = async () => {
    const ratings = await Rating.findAll()
    for (let rating of ratings) {
        let item = await Item.findOne({where: {id: rating.itemId}}).then(async (item) => {
            console.log(item)
            await Item.update({
                counter_rating: item.counter_rating + 1,
                rating: +((item.rating * item.counter_rating + rating.rate) / (item.counter_rating + 1)).toFixed(2),
            }, {where: {id: item.id}})
        })
    }
}

// Вывод таблицы оценок в файл
const genListJSON = async (fileName) => {
    const fs = require('fs');
    const rates = await Rating.findAll()
    let result = ''
    for (let i of rates) {
        result += JSON.stringify(i)
        result += '\n'
    }
    fs.writeFile(fileName, result, 'utf8', (err) => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        } else {
            console.log(`File is written successfully!`);
        }
    });
}

// Вывод таблицы оценок в файл
const genItemsJSON = async (fileName) => {
    const fs = require('fs');
    const items = await Item.findAll()
    let result = ''
    for (let i of items) {
        result += JSON.stringify(i)
        result += '\n'
    }
    fs.writeFile(fileName, result, 'utf8', (err) => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        } else {
            console.log(`File is written successfully!`);
        }
    });
}

const updatePics = async () => {
    const items = await Item.findAll()
    for (i of items) {
        await Item.update
    }
}

module.exports = {
    genUsers,
    genCategoriesList,
    genItemsList,
    genArrayRatings,
    genRatingsList,
    genListJSON,
    genItemsJSON,
    updateAvgRatings
}


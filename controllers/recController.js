const axios = require("axios");
const {Item} = require("../models/models");


class RecController {
    async getRecommendations(req, res) {
        const {id} = req.params
        let data = []
        await axios.get('http://localhost:5000/' + id).then(res => data = res.data)
        let result = []
        for (let i = 0; i < data.length; i++) {
            await Item.findOne({
                where: {id: data[i]}
            }).then((item) => {
                result.push(item)
            })

        }
        return res.json(result)
    }
}

module.exports = new RecController()
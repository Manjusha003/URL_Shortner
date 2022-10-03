const urlModel = require("../models/urlModel")
const validUrl = require("valid-url")
const shortid = require("shortid")
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    14431,
    "redis-14431.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("MxfQxTtqnI6TQeXdgYxM97XgDVeZPBn9", function (err) {
    if (err) throw err;
});
redisClient.on("connect",async function(){
    console.log("Redis Is connected")
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
const SET_EX = promisify(redisClient.SETEX).bind(redisClient)



const createUrl = async (req, res) => {
    try {
        let body = req.body

        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: "Please provide data in body. (longUrl)" })

        const { longUrl, ...rest } = body

        if (!longUrl) return res.status(400).send({ status: false, message: `longUrl is mandatory!` })

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `This {${Object.keys(rest)}} field is not required` })

        if (typeof longUrl != "string" || longUrl.trim() == "") return res.status(400).send({ status: false, message: `longUrl will in string only.` })

        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: `This longUrl value is not valid. (${longUrl})  ` })

        let urlFind = await urlModel.findOne({ longUrl: longUrl })

        //<----------------------------checking for url in Database----------------------->
        if (urlFind) return res.status(200).send({ status: true, data: urlFind })

        let urlCode = shortid.generate(longUrl)
        body.urlCode = urlCode.toLowerCase()

        let baseUrl = "http://localhost:3000/"
        let shortUrl = baseUrl.concat(body.urlCode)
        body.shortUrl = shortUrl

        let urlSave = await urlModel.create(body)
        return res.status(201).send({ status: true, data: urlSave })


    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}



const getUrl = async function (req, res) {
    try {
        let param = req.params.urlCode
        let cacheUrlData = await GET_ASYNC(`${param}`)
        console.log(cacheUrlData)
        if (cacheUrlData) {
            res.status(302).redirect(JSON.parse(cacheUrlData))
        } else {
            let findUrl = await urlModel.findOne({ urlCode: param }).select({longUrl:1,_id:0})
            console.log(findUrl.longUrl)
            if (findUrl == null) return res.status(404).send({ status: false, message: `No url found with this ${param}` })
            await SET_ASYNC(`${param}`, JSON.stringify(findUrl.longUrl))
            res.status(302).redirect(findUrl.longUrl)
        }

    }
    catch (err) { return res.status(500).send({ status: false, error: err.message }) }
}


module.exports = { createUrl, getUrl }
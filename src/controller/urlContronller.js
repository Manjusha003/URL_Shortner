const urlModel = require("../models/urlModel")
const validUrl = require("valid-url")
const mongoose = require("mongoose")
const shortid = require("shortid")



const createUrl = async (req, res) => {
    try {
        let body = req.body

        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: "Please provide data in body. (longUrl)" })

        const { longUrl, ...rest } = body

        if (!longUrl) return res.status(400).send({ status: false, message: `longUrl is mandatory!` })

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `This ${rest} field is not required` })

        if (typeof longUrl != "string" || longUrl.trim() == "") return res.status(400).send({ status: false, message: `longUrl will in string only.` })

        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: `This (${longUrl}) longUrl is not valid ` })

        let shorterUrl = shortid.generate(longUrl)
        console.log(shorterUrl)

        

        res.status(201).send({status: true, data : shorterUrl})


    
    } catch(err) {
        console.log(err)
        res.status(500).send({status: false, error: err})
    }
}







module.exports = { createUrl }
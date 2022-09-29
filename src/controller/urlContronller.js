const urlModel = require("../models/urlModel")
const validUrl = require("valid-url")
const shortid = require("shortid")


function isUrlValid(userInput) {
    var res = userInput.match(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/);
    if(res == null)
        return false;
    else
        return true;
}


const createUrl = async (req, res) => {
    try {
        let body = req.body

        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: "Please provide data in body. (longUrl)" })

        const { longUrl, ...rest } = body

        if (!longUrl) return res.status(400).send({ status: false, message: `longUrl is mandatory!` })

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `This {${Object.keys(rest)}} field is not required` })

        if (typeof longUrl != "string" || longUrl.trim() == "") return res.status(400).send({ status: false, message: `longUrl will in string only.` })

        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: `This longUrl value is not valid. (${longUrl})  ` })

        if(!isUrlValid(longUrl)) return res.status(400).send({ status: false, message: `This (${longUrl}) longUrl is not valid  should be in lowercase` })

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
        res.status(500).send({ status: false, error: err })
    }
}



const getUrl = async function (req, res){
     try{
        let param = req.params.urlCode
        console.log(param)
     if(!param) return res.status(400).send({status:false, message:"Please enter urlCode in path param"})

     let findUrl = await urlModel.findOne({urlCode:param})
     console.log(findUrl)
     if(!findUrl) return res.status(404).send({status:false, message:"No url found with this urlCode"})
     return res.status(302).redirect({status:true, message:"Url found", data:findUrl.longUrl})   
    }
    catch(err){ return res.status(500).send({ status: false, error: err })}
}


module.exports = { createUrl ,getUrl}
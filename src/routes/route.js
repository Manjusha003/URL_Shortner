const express = require("express")
const router = express.Router();
const {createUrl} = require("../controller/urlContronller")



router.get("/test",(req,res)=> res.send({msg:"I am working"}))

//<--------------------URL API's---------------------------->
router.post("/url/shorten", createUrl)
router.get("/:urlCode",)


module.exports = router
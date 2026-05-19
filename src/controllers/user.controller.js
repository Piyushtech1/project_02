import asynchandler from "../utils/asynchandler.js"

const userregister = asynchandler(async (req,res)=>{
    res.status(200).json({
        massage: "hello piyush"
    })
})

export default userregister
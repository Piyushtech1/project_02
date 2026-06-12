import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})
import connectDB from "./db/index.js";
import app from "./app.js";


let port =  process.env.port || 8000

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is running on port : ${port}`);
        
    })
})
.catch((err)=>{
    console.log(`mongoDB connection failed !!!`,err); 
})





















































// import express from "express"

// const app = express()

// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("ERROR: ",(error)=>{
//             console.log("ERROR: ",error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`server run on port ${process.env.PORT}` )
//         })
//     } catch (error) {
//         console.error("ERR:", error)
//         throw error
//     }
// })()    
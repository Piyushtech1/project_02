import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

console.log(process.env.MONGODB_URL)

const connectDB = async () => {
    try {

        const ConnectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}/${DB_NAME}`
        )

        console.log(`MongoDB connected !! on host ${ConnectionInstance.connection.host}`)

    } catch (error) {
        console.log("mongoDB connection error: ", error)
    }
}

export default connectDB
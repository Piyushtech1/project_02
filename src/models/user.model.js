import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    FullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    Avtar:{
        type: String,
        required: true
    },
    CoverImage:{
        type: String,
    },
    WatchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    Password:{
        type: String,
        required: true
    },
    RefreshTokken:{
        type: String,
        required: true
    }
},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("Password")) return next();
    this.Password = await bcrypt.hash(this.Password, 10)
    next()
})


userSchema.methods.isPasswordCorrect =  async function(password){
    return await bcrypt.compare(password,this.Password)
}

userSchema.methods.genrateaccesstoken = function(){
    jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            FullName: this.FullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.genraterefreshtoken = function(){
    jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.Model("User",userSchema)
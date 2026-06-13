import ApiError from "../utils/apierror.js";
import asynchandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT = asynchandler(async (req,_,next)=>
{
    try {
        const token = req.cookies?.accestoken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token) {
            throw new ApiError(401,"unauthorized access")
        }
    
        const decordedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decordedtoken?._id).select("-password -refreshtoken")
    
        if (!user) {
            throw new ApiError(401,"invalid access token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.massage || "Invalid access token")
        console.log(error?.massage)
    }
})
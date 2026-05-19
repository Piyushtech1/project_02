import ApiError from "../utils/apierror.js";
import asynchandler from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudnary.js";
import ApiResponse from "../utils/ApiResponse.js";

const userregister = asynchandler(async (req,res)=>{
    const {username,email,fullname,password} = req.body;
    console.log("Email: ",email)

    if(
        [username,email,fullname,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"all field are required")
    }

    const existingUser = User.findOne({
        $or: [{username},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"user exist")
    }

    const Avtarlocalpath = req.field?.Avtar[0]?.path;
    const CoverImagelocalpath = req.field?.CoverImage[0]?.path;

    if (!Avtarlocalpath) {
        throw new ApiError(400, "Avtar file is required")
    }

    const avtar = await cloudinary(Avtarlocalpath)
    const coverImage = await cloudinary(CoverImagelocalpath)

    if(!Avtar){
        throw new ApiError(400,"Avtar is required")
    }

    const user = await User.Create({
        fullname,
        Avtar: avtar.url,
        CoverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -RefreshTokken"
    )

    if(!createdUser){
        throw new ApiError(500, "user add failed")
    }

    return res.status(201).json{
        new ApiResponse(200,"usercreated successfully")
    }
})

export default userregister
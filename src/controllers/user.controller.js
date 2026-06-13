import ApiError from "../utils/apierror.js";
import asynchandler from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";
import uploadoncloudinay from "../utils/cloudnary.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


const genratingaccessandrefreshtoken = async (userId)=>
{
    try {
        const user = await User.findById(userId)
        const accestoken = user.genrateaccesstoken()
        // console.log("that is real accesstoken",accestoken)
        const refreshtoken = user.genraterefreshtoken()
        // console.log("that is real refreshtoken",refreshtoken)
        user.refreshtoken = refreshtoken
        await user.save({validateBeforeSave: false})
        return {accestoken,refreshtoken}
    } catch (error) {
        throw new ApiError(500, "error acure when genrating access and refresh token")
    }
}

const userregister = asynchandler(async (req,res)=>{
    const {username,email,FullName,Password} = req.body;
    console.log("Email: ",email)

    if(
        [username,email,FullName,Password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"all field are required")
    }

    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"user exist")
    }
    const Avtarlocalpath = req.files?.Avtar[0]?.path;
    // const CoverImagelocalpath = req.files?.CoverImage[0]?.path;
    let CoverImagelocalpath
    if(req.files && Array.isArray(req.files.CoverImage) && req.files.CoverImage.length > 0)
    {
        CoverImagelocalpath = req.files?.CoverImage[0]?.path
    }

    if (!Avtarlocalpath) {
        throw new ApiError(400, "Avtar file is required")
    }

    const Avtar = await uploadoncloudinay(Avtarlocalpath)
    console.log("Cloudinary response:, Avtar")
    const coverImage = await uploadoncloudinay(CoverImagelocalpath)

    if(!Avtar){
        throw new ApiError(400,"Avtar is required")
    }

    const user = await User.create({
        FullName,
        Avtar: Avtar.url,
        CoverImage: coverImage?.url || "",
        email,
        Password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -RefreshTokken"
    )

    if(!createdUser){
        throw new ApiError(500, "user add failed")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"usercreated successfully")
    )
})

const userlogin = asynchandler(async (req, res)=>{
/*
    get data from req.body,
    take user and eamil,
    find user,
    check password,
    give access tokken and refresh tokken to user,
    give cookie
*/ 

    const {username, email, password} = req.body

    if (!(username || email)) {
        throw new ApiError(400, "please enter username or email")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if (!user) {
        throw new ApiError(400,"user does not exist")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "password is not valid")
    }

    const {accestoken, refreshtoken}= await genratingaccessandrefreshtoken(user._id)
    // console.log(accestoken)
    // console.log(refreshtoken)

    const loggedin = await User.findById(user._id).select("-password -refreshtoken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accestoken", accestoken, option)
    .cookie("refreshtoken", refreshtoken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: [loggedin, accestoken, refreshtoken]
            },
            "user logged in successfully"
        )
    )
})

const logoutuser = asynchandler( async (req,res)=>
{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                RefreshTokken: undefined
            }
        },
        {
            returnDocument: "after"
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }
    // res.clearCookie("accesstoken",option)
    return res.status(200)
    .clearCookie("accestoken",  option)
    .clearCookie("refreshtoken", option)
    .json(new ApiResponse(200,{},"user logout")
    )
})

const refreshaccesstoken = asynchandler(async (req,res)=>
{
    const incomingrefreshtoken = req.cookie.refreshtoken || req.body.refreshtoken


    if (!incomingrefreshtoken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decordedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decordedtoken?._id)
    
        if (!user) {
            throw new ApiError(401,"invalid refresh token")
        }
    
        if (incomingrefreshtoken !== user?.RefreshTokken) {
            throw new ApiError(401,"Refresh token is expire or used")
        }
    
        const option = {
            httpOnly: true,
            secure: true
        }
    
        const {accesstoken, refreshtoken}= await genratingaccessandrefreshtoken(User._id)
    
        return res(
            status(200)
            .cookie("accesstoken", accesstoken, option)
            .cookie("refreshtoken", refreshtoken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        accesstoken,
                        refreshtoken
                    },
                    "Access token refreshed"
                )
            )
        )
    } catch (error) {
        throw new ApiError(401,"invallid REFRESH token")
    }
})

export {
    userregister,
    userlogin,
    logoutuser,
    refreshaccesstoken
}
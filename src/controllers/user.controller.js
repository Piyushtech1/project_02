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

const changecurrentpassword = asynchandler(async (req,res)=>
{
    const {oldpassword,newpassword} = req.body

    const user = await User.findById(req.user?._id)

    const ispasswordcorrect = await user.isPasswordCorrect(oldpassword)

    if (!ispasswordcorrect) {
        throw new ApiError(401,"incorrect password")
    }

    user.Password = newpassword
    await user.save({validateBeforeSave: true})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password update successfully"))
})

const getcurrentuser = asynchandler(async (req,res)=>
{
    return res.status(200).json(200,req.user,"User get successfully")
})

const updateaccountdetaile = asynchandler(async(req,res)=>
{
    const {fullName, email} = req.body

    if (!fullname && !email) {
        throw new ApiError(401,"all field are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")
})

const updateuseravtar = asynchandler(async (req,res)=>
{
    const avtarloaclpath = req.file?.path

    if (!avtarloaclpath) {
        throw new ApiError(401,"avtar path is not found")
    }

     const avtar = await uploadoncloudinay(avtarloaclpath)

     if (!avtar.url) {
        throw new ApiError(401,"error on uplouding avtar")
     }

     await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avtar: avtar.url
            }
        },
        {
            new: true
        }
     )

     return res
     .status(200)
     .json(200,user,"avtar update successfully")
})
const updateuserCoverImage = asynchandler(async (req,res)=>
{
    const CoverImageloaclpath = req.file?.path

    if (!CoverImageloaclpath) {
        throw new ApiError(401,"CoverImage path is not found")
    }

     const CoverImage = await uploadoncloudinay(CoverImageloaclpath)

     if (!CoverImage.url) {
        throw new ApiError(401,"error on uplouding CoverImage")
     }

     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                CoverImage: CoverImage.url
            }
        },
        {
            new: true
        }
     )

     return res
     .status(200)
     .json(200,user,"CoverImage update successfully")
})
export {
    userregister,
    userlogin,
    logoutuser,
    refreshaccesstoken,
    changecurrentpassword,
    getcurrentuser,
    updateuseravtar,
    updateuserCoverImage
}
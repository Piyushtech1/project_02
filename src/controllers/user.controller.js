import ApiError from "../utils/apierror.js";
import asynchandler from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";
import uploadoncloudinay from "../utils/cloudnary.js";
import ApiResponse from "../utils/ApiResponse.js";

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

export default userregister
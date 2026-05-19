import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import { response } from "express";
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDNARY_CLOUD_NAME,
    api_key:process.env.CLOUDNARY_API_KEY,
    api_secret:process.env.CLOUDNARY_API_SECRET
}); 


const uploadoncloudinay = async (localfilepath) =>{
    try{
        if(!localfilepath) return null
        const Response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: 'auto'
    })
    console.log("file is uploaded successfully",response.url);
    return response
    
    }catch(error){
        fs.unlinkSync(localfilepath)
        return null
    }
}

export default cloudinary
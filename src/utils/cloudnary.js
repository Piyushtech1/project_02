import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: "drhfkuvsa",
    api_key: "124317998745199",
    api_secret: "LCwpiPcUHNI3374F6Gg8TEPsCtI"
}); 






const uploadoncloudinay = async (localfilepath) =>{
    try{
        if(!localfilepath){
            return null  
        } 
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: 'auto'
    })
    // console.log("file is uploaded successfully",response.url);
    fs.unlinkSync(localfilepath)
    return response
    
    }catch(error){
        console.log("FULL CLOUDINARY ERROR:");
        console.log(error);
        fs.unlinkSync(localfilepath)
        return null
    }
}

export default uploadoncloudinay
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // File uploaded
        console.log("File is uploaded ", response.url);
        console.log(response.url)
        return response;
    } catch (error) {
        fs.unlink(localFilePath) // removed the locally saved temporary file as the upload operation file got filed
        return null
    }
}

export {uploadCloudinary}
import {v2 as cloudinary} from 'cloudinary';
import fs from  "fs"


//configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded sucessfully on Cloudinary
        // console.log("file has been uploaded sucessfully on Cloudinary", 
        // response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);  // Log the error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        // remove the locally save temp file as operation 
        // got failed
        return null;
    }
}

export {uploadOnCloudinary}
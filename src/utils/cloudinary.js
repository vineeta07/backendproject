import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

   cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET   
    });

    const uploadOnCloudinary = async (localFilePath) =>{
        try{
            if(!localFilePath) {
                console.log("file path is required")
            }
            const response = await cloudinary.uploader.upload(localFilePath , {  //upload the file on cloudinary
                resource_type: "auto"
            })
            //file has been uploaded successfully 
            console.log("file is uploaded on cloudinary" , response.url);
            return response;

        }catch(error){
            fs.unlinkSync(localFilePath) // delete the locally saved temporary file
            // as the upload operation failed and it is not uploaded on cloudinary
            return null;
        }
    }

    //another method to upload i.w given on cloudinary
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult); 

    export {uploadOnCloudinary}
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {     // CB - CALLBACK , from request we configure the json data
    cb(null, './public/temp')               // but not file thats why we are using multer middleware for file data
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // to give unique name to file 
    //cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null , file.originalname) // but multiple file of same name can be there and overwrite each other but it is 
    //there for a specific time locally on server then we will upload on cloudinary and then it will be deleted
  }
})

 export const upload = multer({ 
    storage,
 })

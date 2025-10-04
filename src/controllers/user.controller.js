import {asyncHandler} from "../utils/asyncHandler.js" ;
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req , res)=>{
    //  res.status(200).json({
    //     message : "hello there"
    // })

    /*Steps to register a user 
    1. get user details from frontend 
    2. validation - not empty 
    3.check if user already exists : username , email 
    4. check for images , avatar 
    5. upload them to cloudinary 
    6. create user object - create entry in db 
    7. remove password and refresh token from response 
    8.check for user creation 
    9. send response otherwise errors */

    // 1.get user details from frontend 
    const { username , email , fullname , password } = req.body 
    console.log("req.body" , req.body)
    console.log("email" , email)

    // 2.validation - not empty

    /*if(fullname == ""){
        throw new apiError(400 , "fullname is required")
    } but we will have to write a lot of for loops for every
     condn like username , emaik , password*/

     if(
        [username , email , fullname , password].some((field) =>field?.trim() === "")
     ){
        throw new apiError(400 , "All fields are required")
     }

    // 3.check if user already exists : username , email

    const existedUser = await User.findOne({    // await because talking with db and db is in another continent 
        $or : [{ username },{ email}]
    })
    console.log("existedUser" , existedUser)
    if(existedUser){
        throw new apiError(409 , " User with email or username already exists")
    }

    // 4. check for images , avatar

    const avatarLocalPath = req.files?.avatar[0]?.path ;
    //const ImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new apiError (400 , "Avatar is required")
    }

    // 5. upload them to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = null;
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath) ;
    }// await kyuki server ko time lgta hau 
    if(!avatar) {
        throw new apiError(400 ,"Avatar is required")
    }

     //  6. create user object - create entry in db 

     const user = await User.create({                    //db se baat krte time 1.potentially error mil skta hai 
        fullname ,                    // 2. db is in another continent
        avatar: avatar.url,
        coverImage : coverImage?.url|| "",
        email , 
        password , 
        username : username.toLowerCase(),

    })
    console.log("user" , user)
    //7. remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    ) /* mongodb har ek entry ke saath ._id naam ka field add krti hai so
    we can use this to check if user is created or not */ 

    //8. check for user creation 
    console.log("createdUser" , createdUser)

    if(!createdUser){
        throw new apiError(500 , "something went wrong while registering the user ")
    }

    //9. send response otherwise errors
    // return res.status(201).json({createdUser})
    return res.status(201).json(                  // postman expects .status(code)
        new apiResponse(201 , createdUser , "user created successfully")
    )
   

})




export {registerUser}
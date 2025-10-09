import {asyncHandler} from "../utils/asyncHandler.js" ;
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessandRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshtoken()

        user.RefreshToken = RefreshToken
        await user.save({ validateBeforeSave : false })

        return { AccessToken , RefreshToken}

    } catch(error){
        throw new apiError (500 , "something went wrong while generating access and refresh tokens")
    }
}

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
    console.log("req.files:", req.files);
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

const loginUser = asyncHandler(async(req , res)=>{
 /* To login the user
 1. req body -> data
 2. username or password
 3. check if user exists 
 4. password vereification
 5. access and refresh tokens
 6. send cookies
 */

 //  1. req body -> data
 const {username , email ,password} = req.body
 console.log("email", email)
// 2. username or password

if(!username && !email){
    throw new apiError(400, "username or email is required")
}
// 3. check if user exists 

const userExists = await User.findOne({         //await db is in another continent
    $or : [{ username } , { email }]
})
if(!userExists){
    throw new apiError(404 , "user not found ")
}

//  4. password vereification

const isPasswordCorrect = await userExists.isPasswordCorrect(password)
if(!isPasswordCorrect){
    throw new apiError(401 , "invalid password")
}

// 5. access and refresh tokens

const {accessToken , refreshToken}= await generateAccessandRefreshTokens(userExists._id)
// await -> tokens generate krne mai time lg skta hai 

//  6. send cookies

const logInUser = await User.findById(userExists._id).select(
    "-password -refreshTokens"
)

const options = {
    httpOnly : true ,    // only modifiable from server not frontend  
    secure : true
}

return res.status(200)
 .cookie("accessToken" , accessToken , options)
 .cookie("refreshToken" , refreshToken , options)
 .json (
    new apiResponse( 
        200 , 
        {user : logInUser, accessToken , refreshToken},
         "user Logged In successfully"
    )
 )

})

const logOutUser = asyncHandler(async(req , res)=>{
    await User.findByIdAndUpdate(
        req.user._id ,
        {
            $set: {
                refreshTokens : undefined
            }
        } ,
        {
            new : true
        }
    )

    const options = {
        httpOnly : true ,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new apiResponse(200 , {} , " User logged out successfully"))
    
})
 
const refreshAccessToken = asyncHandler(async(req, res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    if(!incomingRefreshToken){
        throw new apiError(401, "unauthorized request")
    }

   try {
     const decodedToken = jwt.verify( incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id)
 
     if(!user ){
         throw new apiError(401 , "invalid Refresh token")
     }
 
     if( incomingRefreshToken !== user?.refreshTokens){
         throw new apiError(401 , " Unauthorized - refresh Token is used or expired")
     }
 
     const {accesstoken , refreshtoken}=await generateAccessandRefreshTokens(user._id);
 
     const options= {
         httpOnly: true,
         secure : true 
     }
 
     return res.status(200)
     .cookie("Accesstoken" , accesstoken , options)
     .cookie("Refreshtoken" , refreshtoken , options)
     .json(new apiResponse(200 , {accesstoken , refreshtoken} , "Access token refreshed"))

   } catch (error) {
      throw new apiError(401, error?.message && "invalid refresh token!!!")
   }

 })

const ChangePassword = asyncHandler(async(req , res)=>{
    const { oldPassword , newPassword} = req.body 

    const user = await User.findById(req.user?._id)

    const checkingPassword = await user.isPasswordCorrect(oldPassword)

    if(!checkingPassword){
        throw new apiError(400 , "Invalid old Password")
    }

     user.password = newPassword
     await user.save({validationBeforeSave : false })

     return res.status(200)
     .json(new apiResponse(200 , {} , "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200)
    .json(200 , req.user , "current user fetched successfully")
})

const UpdateAccountDetails = asyncHandler(async(req, res)=>{
    const {email , fullname} = req.user
    if(!email || !fullname){
        throw new  apiError(400 , "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id , 
        {
            $set : {
                fullname ,
                email: email
            }
        },{
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200 , user , "user detailes updated successfully"))
})

const updateuserAvatar =asyncHandler(async(req,res)=>{
    const avatarLocalPath= req.file?.path;
    if(!avatarLocalPath){
        throw new apiError(400 , "Avatar is required")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new apiError(400 , "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        } , {new : true}
    ).select("-password")
    
    res.status(200)
    .json(new apiResponse( 200 , user, "User avatar updated successfully"))

})

const updatecoverImage =asyncHandler(async(req,res)=>{
    const coverImageLocalPath= req.file?.path;
    if(!coverImageLocalPath){
        throw new apiError(400 , "coverImage is required")
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new apiError(400 , "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        } , {new : true}
    ).select("-password")

    
    res.status(200)
    .json( new apiResponse( 200 , user , "User coverImage updated successfully"))

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new apiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new apiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser,
    loginUser ,
    logOutUser,
    refreshAccessToken , 
    ChangePassword ,
    getCurrentUser,
    UpdateAccountDetails ,
    updateuserAvatar,
    updatecoverImage,
    getWatchHistory ,
    getUserChannelProfile

}
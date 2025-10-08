import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"


export const verifyJWT = asyncHandler(async(req, _ , next)=>{
    try {
        const authHeader = req.get("Authorization") || req.header("Authorization"); 
        console.log("authHeader:", authHeader, "cookieToken:", req.cookies?.accessToken);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
        // Authorization : Bearer <token> hame token nhi bejna header mai so "" 
       
        if(!token){
            throw new apiError(401, "Unauthorized request!")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshTokens"
        )
    
        if(!user){
            throw new apiError(401 , "Invalid AccessToken")
        }
    
        req.user = user  // req.user will be available in next middlewares
        next()
    } catch (error) {
        throw new apiError(401 , "Invalid accessToken!!")
    }
})
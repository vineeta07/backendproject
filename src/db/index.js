import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async ()=>{  // async coz database is in another continent
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGODB connecteed !! DB HOST: ${connectionInstance.connection.host}` )
    }catch(error){
        console.log("mongoDB connection failed:" , error)
        process.exit(1)
    }
} 

export default connectDB;
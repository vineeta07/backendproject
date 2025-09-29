// require("dotenv").config({path: './env'}); 

import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})


connectDB() 


 


/*Another approach to connect to mongodb and start server
import express from "express";
const app = express();

(async()=>{
    try{
        await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log("ERROR: ", error)
            throw error
        })

        app.listen(process.env.PORT , ()=>{
            console.log(`App is listening on port${process.env.PORT}`)
        })

     } catch(error){
        console.log("Error:" , error);
        throw error

    }
})()
    */
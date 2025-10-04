import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN , // frontend url
    credentials: true,
}))

app.use(express.json({limit: "16 kb"}))
app.use(express.urlencoded({extended : true , limit: "16kb"})) 
app.use(express.static("public "))
app.use(cookieParser())

//routes import 
import userRoutes from "./routes/user.routes.js"; // we can only import like this if there is default export

//route declaration
app.use("/api/v1/users" , userRoutes)

export{app}

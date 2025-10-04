import {Router } from "express"; 
import {registerUser} from "../controllers/user.controller.js"; // we can only only import like this if there is no default export only export{}

import {upload} from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([   // middleware 
        {
            name : "avatar",
            maxcount: 1
        },
        {
            name :"coverImage" ,
            maxcount : 1
        }
    ]),
    registerUser     // method from controller
);

export default router  
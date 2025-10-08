import {Router } from "express"; 
import {loginUser, logOutUser, registerUser, refreshAccessToken} from "../controllers/user.controller.js"; // we can only only import like this if there is no default export only export{}
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT, logOutUser );
router.route("/refreshtoken").post(refreshAccessToken);

export default router  
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

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
export default router  
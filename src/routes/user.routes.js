import {Router } from "express"; 
import {registerUser} from "../controllers/user.controller.js"; // we can only only import like this if there is no default export only export{}

const router = Router();

router.route("/register").post(registerUser);

export default router  
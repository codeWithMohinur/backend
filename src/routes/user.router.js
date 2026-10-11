import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(
    validJWT,
    logoutUser
)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(
    validJWT, 
    changeCurrentPassword
)

router.route("/get-current-user").post(
    validJWT, 
    getCurrentUser
)

export default router
import { Router } from "express";
import {logoutuser, refreshaccesstoken, userlogin, userregister} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const routes = Router()

routes.route("/register").post(
    upload.fields([
        {
            name: "Avtar",
            maxCount: 1
        },
        {
            name: "CoverImage",
            maxCount:1
        }
    ]),
    userregister
)
routes.route("/login").post(userlogin)

routes.route("/logout").post(verifyJWT, logoutuser)

routes.route("/refresh-token").post(refreshaccesstoken)

export default routes
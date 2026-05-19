import { Router } from "express";
import userregister from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
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
// routes.route("/login").post(userregister)

export default routes
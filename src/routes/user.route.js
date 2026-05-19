import { Router } from "express";
import userregister from "../controllers/user.controller.js";

const routes = Router()

routes.route("/register").post(userregister)
// routes.route("/login").post(userregister)

export default routes
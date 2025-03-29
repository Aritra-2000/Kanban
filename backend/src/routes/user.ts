import { Hono } from "hono";
import UserController from "../controllers/user.controller";
import { auth } from "../middlerwares/auth.middleware";



export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>

const userController = new UserController();

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/count", userController.getCount);
userRouter.get("/me", auth, userController.getCurrentUser);
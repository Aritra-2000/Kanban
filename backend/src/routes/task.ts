import { Hono } from "hono"
import TaskController from "../controllers/task.controller"


export const taskRouter = new Hono<{
    Bindings:{
          DATABASE_URL: string,
          JWT_SECRET: string,
    }
}>

const taskController = new TaskController();


taskRouter.get("/:section", taskController.getTask)
taskRouter.post("/", taskController.addTask)
taskRouter.put("/:taskId", taskController.updatetask)
taskRouter.delete("/:taskId", taskController.deleteTask)
taskRouter.patch("/move", taskController.moveTask)
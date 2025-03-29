import { Hono } from "hono";
import SectionController from "../controllers/section.controller";


export const sectionRouter = new Hono<{
    Bindings:{
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>


const sectionController = new SectionController();

sectionRouter.get("/", sectionController.getSections);
sectionRouter.post("/", sectionController.addSection);
sectionRouter.delete("/:id", sectionController.deleteSection);
sectionRouter.put("/:id", sectionController.updateSection);
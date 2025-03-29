import { taskInput } from "@aritra-paul/kanban-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";


export default class TaskController{

    async getTask(c:Context){

        const {sectionId} = c.req.param();

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {
            const section = await prisma.section.findUnique({
                where: { id: sectionId },
                include: { tasks: true }
            })

            if (!section) {
                c.status(404)
                return c.json({ message: "Section not found" })
            }

            return c.json(section.tasks);
        } catch (error) {
            c.status(403);
            return c.json({error: "error while finding task"});
        }
    }

    async addTask(c:Context){

        const body = await c.req.json();
        const parseResult = taskInput.safeParse(body)

         if (!parseResult.success) {
            c.status(400)
            return c.json({
                message: "Invalid input",
                errors: parseResult.error.errors
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        const { name, description, dueDate, assignee, sectionId } = parseResult.data;

        try {
            
            const section = await prisma.section.findUnique({
                where: { id: sectionId }
            })

            if (!section) {
                c.status(404)
                return c.json({ 
                    message: "Section not found" 
                })
            }

            const newTask = await prisma.task.create({
                data: {
                    name: name,
                    description:description,
                    dueDate: dueDate,
                    assignee: assignee?.trim(),
                    sectionId: section.id
                }
            })

            console.log(newTask);

            const ad = await prisma.section.update({
                where:{
                    id: section.id
                },
                data:{
                    tasks:{
                        connect:{id: newTask.id}
                    }
                }
            });

            console.log(ad);
            
            c.status(201);
            return c.json(newTask);
        } catch (error) {
            c.status(500);
            return c.json({ error: 'An error occurred while adding the task'})
        }
    }


    async updatetask(c: Context){

        const {taskId} = c.req.param();
        const body = await c.req.json();

        console.log("Attempting to update task with ID:", taskId);
        console.log("Request body:", body);

        const {success} = taskInput.safeParse(body);

        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl:c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {

            const existingTask = await prisma.task.findUnique({
                where:{
                    id: taskId
                }
            });

            console.log("Existing task result:", existingTask);

            if(!existingTask) {
                c.status(404);
                return c.json({ error: 'Task not found' });
            }

            if(body.sectionId) {
                const section = await prisma.section.findUnique({
                  where: { id: body.sectionId },
                });
          
                if (!section) {
                  c.status(404);
                  return c.json({ error: 'Section does not exist' });
                }
            }

            const {name, description, dueDate, assignee, sectionId}  = body;

            const updateTask = await prisma.task.update({
                where:{
                    id: taskId
                },
                data:{
                    name: name || existingTask.name,
                    description: description || existingTask.description,
                    dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
                    assignee: assignee? assignee.trim() : existingTask.assignee,
                    sectionId: sectionId || existingTask.sectionId
                }
            })

            c.status(200)
            return c.json(updateTask);
        } catch (error) {
            c.status(500);
            return c.json({ error: 'An error occurred while updating the task' });
        }
    }

    async moveTask(c: Context){

        const body = await c.req.json();
        const {success} = taskInput.safeParse(body);

        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }


        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {

            const sourceSection = await prisma.section.findUnique({
                where:{
                    id: body.sourceSectionId
                },
                include:{
                    tasks: true
                }
            });

            const destinationSection = await prisma.section.findUnique({
                where:{
                    id: body.destinationSectionId
                },
                include:{
                    tasks: true
                }
            });

            if (!sourceSection || !destinationSection) {
                c.status(403);
                return c.json({
                    error: "Source or Destination section not found"
                });
            }

            const existingTask = await prisma.task.findUnique({
                where:{
                    id : body.taskId
                },
                include:{
                    section: true
                }
            });

            if(!existingTask){
                c.status(403);
                return c.json({
                    error: "Task not found"
                })
            }

            await prisma.section.update({
                where:{
                    id: body.sourceSectionId
                },
                data:{
                    tasks:{
                        disconnect:{id: body.taskId}
                    },
                },
            });

            await prisma.task.update({
                where:{
                    id: body.taskId
                },
                data:{
                    sectionId: body.destinationSectionId
                }
            });

            await prisma.section.update({
                where:{
                    id: body.destinationSectionId
                },
                data:{
                    tasks:{
                        connect:{
                            id: body.taskId
                        }
                    }
                }
            })

            const updateTask = await prisma.task.findUnique({
                where:{
                    id: body.taskId
                },
                include:{
                    section: true
                }
            });

            c.status(200);
            return c.json(updateTask);
        } catch (error) {
            c.status(500);
            return c.json({ error: 'An error occurred while moving the task' });
        }
    }

    async deleteTask(c: Context){
        
        const {taskId} = c.req.param();

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {

            const existingTask = await prisma.task.findUnique({
                where:{
                    id: taskId
                }
            });

            if(!existingTask){
                c.status(403);
                return c.json({
                    error: "Task not found"
                })
            }

            await prisma.task.delete({
                where:{
                    id: taskId
                }
            });

            c.status(200);
            c.json({ message: "Task deleted successfully"});

        } catch (error) {
            c.status(500);
            return c.json({ error: 'An error occurred while deleting the task' });
        }
    }


}
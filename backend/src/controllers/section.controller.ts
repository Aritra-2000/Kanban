import { sectionInput, updateSectionInput } from "@aritra-paul/kanban-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";


export default class SectionController{

    async getSections(c: Context){

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());
          
        try {
            const sections = await prisma.section.findMany({
                include:{
                    tasks:true
                },
                orderBy:{
                    createdAt: 'asc',
                }
            });

            c.status(200);
            return c.json(sections);
        } catch (error) {
            c.status(500);
            return c.json({ error: 'An error occurred while fetching sections' });
        }
    }

    async addSection(c:Context){
        
        const body = await c.req.json();
        let creationDate = new Date();

        const {success} = sectionInput.safeParse(body);
        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());
        
        const {name, sectionId} = body;

        try {

            if(sectionId){
               
                const selectedSection = await prisma.section.findUnique({
                    where:{
                        id: sectionId
                    }
                })

                if(selectedSection){
                    creationDate = new Date(new Date(selectedSection.createdAt).getTime() + 1000);
                }
            }

            const newSection = await prisma.section.create({
                data:{
                    name: name,
                    createdAt: creationDate,
                    tasks: {
                        create: [],
                    }
                }
            });

            c.status(201);
            return c.json(newSection);
        } catch (error) {
            c.status(400);
            return c.json({ message: 'Error adding section'});
        } 
    }

    async deleteSection(c: Context){
          
        const {id} = c.req.param();

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {

            const section = await prisma.section.deleteMany({
                where:{
                    id: id
                }
            });

            c.status(200);
            return c.json({message: 'Section deleted successfully'})
        } catch (error) {
            c.status(500);
            return c.json({ message: 'Error deleting section'})
        }
    }

    async updateSection(c: Context){
        
        const body = await c.req.json();
        const {id} = c.req.param();

        const {success} = updateSectionInput.safeParse(body);

        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        const {name} = body;

        try {

            const existingSection = await prisma.section.findUnique({
                where: {
                    id: id
                }
            });
    
            if (!existingSection) {
                c.status(404);
                return c.json({ message: `Section with ID ${id} not found` });
            }
            
            const updatedSection = await prisma.section.update({
                where:{
                    id: id
                },
                data:{
                    name: name
                }
            });

            c.status(200);
            return c.json(updatedSection);
        } catch (error) {
            c.status(500);
            return c.json({ message: 'Error updating section'})
        }
        
    }
}
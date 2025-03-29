import { Context } from "hono";
import { signupInput, loginInput } from "@aritra-paul/kanban-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as bcrypt from "bcryptjs"
import { authUtils } from "../utils/token";
import { getDefaultAvatar, isValidImageURL } from "../utils/file";


export default class UserController{

    async signup (c: Context){

        const body = await c.req.json();
        const {success} = signupInput.safeParse(body);

        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl:c.env.DATABASE_URL,
        }).$extends(withAccelerate())

        try {

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: body.email
                }
            });

            if (existingUser) {
                return c.json({ error: 'Email already taken' }, 409);
            }

            const passwordHash = await bcrypt.hash(body.password, 10);

            let finalPic = body.profile;

            if(!body.profile){
                finalPic = getDefaultAvatar(body.name);
            }else if(!isValidImageURL(body.profile)){
                return c.json({ error:"Invalid photo URL. Must be a .jpg, .jpeg, or .png link."})
            }

            const user = await prisma.user.create({
                data:{
                    name: body.name,
                    email: body.email,
                    password: passwordHash,
                    profilePic: body.profile || ""
                }
            })

            const token = await authUtils.generateToken({
                id:user.id,
                email: user.email
            }, c);

            authUtils.setAuthCookie(c, token);
            
            c.status(200);
            return c.json({
                token,
                user:{
                    id: user.id,
                    email: user.email,
                    password: user.password,
                    profilePic: user.profilePic
                }
            })
        
        } catch (error) {
            c.status(403);
            return c.json({error: "error while sining up"});
        }
    }

    async login(c: Context){
        const body = await c.req.json();
        const {success} = loginInput.safeParse(body);

        if(!success){
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            })
        }

        const prisma = new PrismaClient({
            datasourceUrl:c.env?.DATABASE_URL,
        }).$extends(withAccelerate());

        try {
            
            const user = await prisma.user.findUnique({
                where:{
                    email: body.email
                }
            });

            if(!user){
                return c.json({ error: 'Email not signedUp' }, 409);
            }
            
            const isMatch = await bcrypt.compare(body.password, user.password);

            if(!isMatch){
                return c.json({error: 'Wrong Passwrord!!!'}, 403);
            }

            const token = await authUtils.generateToken({
                id: user.id,
                email: user.email
            }, c);
            
            c.status(200);
            return c.json({
                token,
                user: {
                    id: user.id,
                    name: user.id,
                    profilePic: user.profilePic,
                    email: user.email
                }
            })

        } catch (error) {
            c.status(403);
            return c.json({error: "error while Login"});
        }
    }

    async getCount(c: Context){

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate());

        try {
            const totalUsers = await prisma.user.count();

            c.status(200);
            return c.json({totalUsers});
        } catch (error) {
            c.status(403);
            return c.json({error: "error while Counting Users"});
        }
    }

    async getCurrentUser(c: Context){

        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL
        }).$extends(withAccelerate())

        try {

            const userId = c.get('user')?.id;

            if (!userId) {
                c.status(401);
                return c.json({ error: 'User not authenticated' });
            }

            const user = await prisma.user.findUnique({
                where:{
                    id: userId
                }
            });

            if(!user){
                c.status(404)
                return c.json({error: 'User not found'});
            }

            return c.json({user});
        } catch (error) {
            c.status(500);
            return c.json({ error: 'Failed to fetch user' });
        }
    }

};
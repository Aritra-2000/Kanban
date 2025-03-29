import z from "zod"
import { isValid, parse } from 'date-fns';

export const signupInput = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    profilePic: z.string().optional()
}) 

export const loginInput = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const sectionInput = z.object({
    name: z.string(),
    sectionId: z.string().optional()
})

export const updateSectionInput = z.object({
    name: z.string()
})

export const taskInput = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    dueDate: z.string().transform((val, ctx) => {
    try {
        // Try parsing with different formats
        const formats = ['dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy']
        
        for (const format of formats) {
          const parsedDate = parse(val, format, new Date())
          if (isValid(parsedDate)) {
            return parsedDate
          }
        }
        
        const isoDate = new Date(val)
        if (isValid(isoDate)) {
          return isoDate
        }
        
        throw new Error("Invalid date format")
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid date format. Use dd-MM-yyyy or yyyy-MM-dd'
        })
        return z.NEVER
      }
    }), 
    assignee: z.string().min(1, "Assignee is required"),
    sectionId: z.string().min(1, "Section ID is required").optional(),
  });

  export const moveTaskInput = z.object({
    taskId: z.string(),
    sourceSectionId: z.string(),
    destinationSectionId: z.string()
  });


export type SectionInput = z.infer<typeof sectionInput>;
export type UpdateSectionInput = z.infer<typeof updateSectionInput>;
export type TaskInput = z.infer<typeof taskInput>;
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof loginInput>;
export type MoveTaskInput = z.infer<typeof moveTaskInput>;
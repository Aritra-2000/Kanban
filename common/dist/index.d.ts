import z from "zod";
export declare const signupInput: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    profilePic: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    profilePic?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    profilePic?: string | undefined;
}>;
export declare const loginInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const sectionInput: z.ZodObject<{
    name: z.ZodString;
    sectionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sectionId?: string | undefined;
}, {
    name: string;
    sectionId?: string | undefined;
}>;
export declare const updateSectionInput: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const taskInput: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    dueDate: z.ZodEffects<z.ZodString, Date, string>;
    assignee: z.ZodString;
    sectionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    dueDate: Date;
    assignee: string;
    sectionId?: string | undefined;
}, {
    name: string;
    description: string;
    dueDate: string;
    assignee: string;
    sectionId?: string | undefined;
}>;
export declare const moveTaskInput: z.ZodObject<{
    taskId: z.ZodString;
    sourceSectionId: z.ZodString;
    destinationSectionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    sourceSectionId: string;
    destinationSectionId: string;
}, {
    taskId: string;
    sourceSectionId: string;
    destinationSectionId: string;
}>;
export type SectionInput = z.infer<typeof sectionInput>;
export type UpdateSectionInput = z.infer<typeof updateSectionInput>;
export type TaskInput = z.infer<typeof taskInput>;
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof loginInput>;
export type MoveTaskInput = z.infer<typeof moveTaskInput>;

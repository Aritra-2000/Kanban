"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTaskInput = exports.taskInput = exports.updateSectionInput = exports.sectionInput = exports.loginInput = exports.signupInput = void 0;
const zod_1 = __importDefault(require("zod"));
const date_fns_1 = require("date-fns");
exports.signupInput = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8),
    profilePic: zod_1.default.string().optional()
});
exports.loginInput = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
exports.sectionInput = zod_1.default.object({
    name: zod_1.default.string(),
    sectionId: zod_1.default.string().optional()
});
exports.updateSectionInput = zod_1.default.object({
    name: zod_1.default.string()
});
exports.taskInput = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required"),
    description: zod_1.default.string().min(1, "Description is required"),
    dueDate: zod_1.default.string().transform((val, ctx) => {
        try {
            // Try parsing with different formats
            const formats = ['dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
            for (const format of formats) {
                const parsedDate = (0, date_fns_1.parse)(val, format, new Date());
                if ((0, date_fns_1.isValid)(parsedDate)) {
                    return parsedDate;
                }
            }
            const isoDate = new Date(val);
            if ((0, date_fns_1.isValid)(isoDate)) {
                return isoDate;
            }
            throw new Error("Invalid date format");
        }
        catch (error) {
            ctx.addIssue({
                code: 'custom',
                message: 'Invalid date format. Use dd-MM-yyyy or yyyy-MM-dd'
            });
            return zod_1.default.NEVER;
        }
    }),
    assignee: zod_1.default.string().min(1, "Assignee is required"),
    sectionId: zod_1.default.string().min(1, "Section ID is required").optional(),
});
exports.moveTaskInput = zod_1.default.object({
    taskId: zod_1.default.string(),
    sourceSectionId: zod_1.default.string(),
    destinationSectionId: zod_1.default.string()
});

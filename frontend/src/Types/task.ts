// Create a separate file, e.g., src/types/task.ts
export interface TaskInterface {
    name: string;
    description: string;
    dueDate: string;
    assignee: string;
    sectionId: string;
}

export interface Task extends TaskInterface {
    id: string;
}
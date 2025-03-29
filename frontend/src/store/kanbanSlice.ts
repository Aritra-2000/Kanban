import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import API from "../Axios/api";

    interface Task {
        id?: string;
        name: string;
        description: string;
        dueDate: string;
        assignee: string;
    }
    
    interface Section {
        id: string;
        name: string;
        tasks: Task[];
        createdAt: Date;
        updatedAt: Date;
    }

    interface MoveTaskPayload {
        taskId: string;
        sourceSectionId: string;
        destinationSectionId: string;
        task?: any; 
    }
    
    interface KanbanState {
        sections: Section[];
        loading: boolean;
        error?: string | null;
    }


    const initialState : KanbanState = {
        sections: [],
        loading: false,
        error: null,
    }

    export const fetchSections = createAsyncThunk("kanban/fetchSections", async() =>{
        const response = await API.get<Section[]>("/section");
        console.log('API response:', response.data); 
        return response.data;
    });

    export const addSection = createAsyncThunk("kanban/addSection", async(sectionData:{
        name:string,
        id: string
    }) => {
        try {
            const res = await API.post('/section', sectionData);
            return res.data;
        } catch (error) {
            throw error;
        }
    });


    export const updateSection = createAsyncThunk("kanban/updateSection", async({id, name}:{id: string, name: string}) => {
        await API.put(`/section/${id}`, {name});
        return {id, name};
    });


    export const deleteSection = createAsyncThunk("kanban/deleteSection", async(id: string) => {
        await API.delete(`/section/${id}`);
        return id;
    });

    export const addTask = createAsyncThunk("kanban/addTask", async(taskData:{
            name: string;
            description: string;
            dueDate: string;
            assignee: string;
            sectionId: string;
    }) =>{
        const res = await API.post("/task", taskData);
        return{
            sectionId: taskData.sectionId,
            task: res.data,
        }
    });


    export const updateTask = createAsyncThunk("kanban/updateTask", async({taskId, sectionId, taskData}:{
        taskId: string, 
        sectionId: string, 
        taskData:{
            name: string;
            description: string;
            dueDate: string;
            assignee: string;
            section: string;
        }
    }) =>{
        const res = await API.put(`/task/${taskId}`, taskData);
        return {sectionId, taskId, updatedTask: res.data.task};
    });

    export const deleteTask = createAsyncThunk("kanban/deleteTask", async({ sectionId, taskId}:{sectionId:string, taskId: string})=>{
        await API.delete(`/task/${taskId}`);
        return {sectionId, taskId};
    });

    export const moveTask = createAsyncThunk<
    { 
        taskId: string; 
        sourceSectionId: string; 
        destinationSectionId: string; 
        task: any 
    }, 
        MoveTaskPayload
    >(
        'kanban/moveTask',
        async ({ taskId, sourceSectionId, destinationSectionId, task}, { dispatch }) => {
            try {
                const response = await API.patch(`/task/move`, {
                    taskId,
                    sourceSectionId,
                    destinationSectionId
                });

                return {
                    taskId,
                    sourceSectionId,
                    destinationSectionId,
                    task: response.data.task
                };
            } catch (error) {
                throw error;
            }
        }
    );

const kanbanSlice = createSlice({
    name: "kanban",
    initialState,
    reducers: {
        addSectionLocal: (state, action: PayloadAction<Omit<Section, 'id' | 'createdAt' | 'updatedAt'>>) => {
            const newSection: Section = {
                ...action.payload,
                id: crypto.randomUUID(),
                tasks: action.payload.tasks || [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            state.sections.push(newSection);
        },
        updateSectionLocal: (state, action: PayloadAction<{ sectionId: string; name: string }>) => {
            const { sectionId, name } = action.payload;
            const section = state.sections.find((s) => s.id === sectionId);
            if (section) section.name = name;
        },
        deleteSectionLocal: (state, action: PayloadAction<string>) => {
            state.sections = state.sections.filter((s) => s.id !== action.payload);
        },
        addTaskLocal: (state, action: PayloadAction<{ sectionId: string; task: Task }>) => {
            const { sectionId, task } = action.payload;
            const section = state.sections.find((s) => s.id === sectionId);
            if (section) section.tasks.push(task);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSections.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload;
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addSection.pending, (state) => {
                state.loading = true;
            })
            .addCase(addSection.fulfilled, (state, action) => {
                state.loading = false;
                const newSection = {
                    ...action.payload,
                    tasks: []
                };
                state.sections.push(newSection);
                state.sections.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            })
            .addCase(addSection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateSection.fulfilled, (state, action) => {
                const section = state.sections.find((s) => s.id === action.payload.id);
                if (section) section.name = action.payload.name;
            })
            .addCase(deleteSection.fulfilled, (state, action) => {
                state.sections = state.sections.filter((s) => s.id !== action.payload);
            })
            .addCase(addTask.fulfilled, (state, action) => {

                const { sectionId, task } = action.payload;
                const section = state.sections.find((s) => s.id === sectionId);

                if (section) {
                    if (!section.tasks) section.tasks = [];
                    section.tasks.push({...task
                    });
                }
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const { sectionId, taskId, updatedTask } = action.payload;
                const section = state.sections.find((s) => s.id === sectionId);
                if (section) {
                    const taskIndex = section.tasks.findIndex((t) => t.id === taskId);
                    if (taskIndex !== -1) {
                        section.tasks[taskIndex] = updatedTask;
                    }
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const section = state.sections.find((s) => s.id === action.payload.sectionId);
                if (section) section.tasks = section.tasks.filter((t) => t.id !== action.payload.taskId);
            })
            .addCase(moveTask.fulfilled, (state, action) => {
                const { taskId, sourceSectionId, destinationSectionId, task } = action.payload;

                const sourceSection = state.sections.find(s => s.id === sourceSectionId);
                const destSection = state.sections.find(s => s.id === destinationSectionId);

                if (sourceSection && destSection) {
                        sourceSection.tasks = sourceSection.tasks.filter(t => t.id !== taskId);

                    if (!destSection.tasks) destSection.tasks = [];
                        destSection.tasks.push(task);
                }
            });
    },
});

export default kanbanSlice.reducer;
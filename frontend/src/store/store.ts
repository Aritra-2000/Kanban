import { configureStore } from '@reduxjs/toolkit'
import kanbanReducer from "./kanbanSlice"
import authReducer from "./authSlice"; 

const store = configureStore({
      reducer:{
          kanban: kanbanReducer,
          auth: authReducer,
      }
});

export type RootState = ReturnType<typeof store.getState>

export default store;



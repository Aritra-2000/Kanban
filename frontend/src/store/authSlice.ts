import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import API from "../Axios/api";

interface LoginCredentials {
    email: string;
    password: string;
}

interface authResponse {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      profilePic: string;
    };
}

interface signupCredentials {
    name: string;
    email: string;
    password: string;
    profilePic: string;
}
  
interface KnownError {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    profilePic: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    signupSuccess: boolean;
    userCount: number;
}
  
const initialState: AuthState = {
    user: localStorage.getItem("user") 
      ? JSON.parse(localStorage.getItem("user") as string) 
      : null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    signupSuccess: false,
    userCount: 0
};
  

export const fetchCurrentUser = createAsyncThunk<
        User, 
        void, 
        { rejectValue: string }
    >("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return rejectWithValue("No token found");
            }
    
            const response = await API.get("/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            return response.data;
        } catch (error) {
            const err = error as KnownError
            return rejectWithValue(err.response?.data?.message || "Error fetching user");
        }
    });
    
    export const fetchUserCount = createAsyncThunk("kanban/fetchUserCount", async () => {
        const response = await API.get("/api/v1/auth/count");
        return response.data.totalUsers;
    });
    
export const loginUser = createAsyncThunk<
        authResponse, 
        LoginCredentials, 
        { rejectValue: string }
    >("auth/login", async (credentials, { rejectWithValue }) => {
        try {
            const response = await API.post<authResponse>("/api/v1/auth/login", credentials);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            const err = error as KnownError
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
});
  
export const signupUser = createAsyncThunk<
        authResponse, 
        signupCredentials, 
        { rejectValue: string }
    >("auth/signup", async (credentials, { rejectWithValue }) => {
        try {
            const response = await API.post<authResponse>("/api/v1/auth/signup", credentials);
            return response.data;
        } catch (error) {
            const err = error as KnownError
            return rejectWithValue(err.response?.data?.message || "Signup failed");
        }
});

export const logoutUser = createAsyncThunk("/api/v1/auth/logout", async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
});


const authSlice = createSlice({
        name: "auth",
        initialState,
        reducers: {
            logoutUser: (state) => {
                state.user = null;
                state.token = null;
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            },
            setError: (state, action: PayloadAction<string | null>) => {
                state.error = action.payload;
            }
        },
        extraReducers: (builder) => {
            builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch user';
            })
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.signupSuccess = false;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.loading = false;
                state.signupSuccess = true;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Signup failed';
                state.signupSuccess = false;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Login failed';
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.signupSuccess = false;
            })
            .addCase(fetchUserCount.fulfilled, (state, action) => {
                state.userCount = action.payload;
            });
        },
});

export const { logoutUser: localLogoutUser, setError } = authSlice.actions;
export default authSlice.reducer;
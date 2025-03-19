import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";

// Types
interface TimingInfo {
  relation: "before" | "after" | "start" | "end";
  offset: number;
}

interface Task {
  _id: string;
  description: string;
  duration: number;
  dependencies: Task[] | string[];
  timing: TimingInfo;
  isGlobal: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: Date;
}

interface TaskState {
  globalTasks: Task[];
  privateTasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  globalTasks: [],
  privateTasks: [],
  loading: false,
  error: null
};

// API URL
const API_URL = import.meta.env?.VITE_API_URL;

// Thunks
export const fetchGlobalTasks = createAsyncThunk<
  Task[],
  // void,
  string | undefined,
  { rejectValue: string; state: RootState }
>("tasks/fetchGlobalTasks", async (search=undefined, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    
    let url = `${API_URL}/task/global`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    
    // const response = await fetch(`${API_URL}/task/global`, {
      const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch global tasks");
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

export const fetchPrivateTasks = createAsyncThunk<
  Task[],
  // void,
  string | undefined,
  { rejectValue: string; state: RootState }
>("tasks/fetchPrivateTasks", async (search = undefined, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    let url = `${API_URL}/task/private`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    // const response = await fetch(`${API_URL}/task/private`, {
      const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch private tasks");
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

interface CreateTaskPayload {
  taskData: Omit<Task, "_id">;
  isGlobal: boolean;
}

export const createTask = createAsyncThunk<
  Task,
  CreateTaskPayload,
  { rejectValue: string; state: RootState }
>("tasks/createTask", async ({ taskData, isGlobal }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    const endpoint = isGlobal ? "global" : "private";
    
    const response = await fetch(`${API_URL}/task/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${isGlobal ? 'global' : 'private'} task`);
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

interface UpdateTaskPayload {
  id: string;
  taskData: Partial<Omit<Task, "_id">>;
  isGlobal: boolean;
}

export const updateTask = createAsyncThunk<
  Task,
  UpdateTaskPayload,
  { rejectValue: string; state: RootState }
>("tasks/updateTask", async ({ id, taskData, isGlobal }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    const endpoint = isGlobal ? "global" : "private";
    
    const response = await fetch(`${API_URL}/task/${endpoint}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${isGlobal ? 'global' : 'private'} task`);
    }

    const data = await response.json();
    return data.updatedTask;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

interface DeleteTaskPayload {
  id: string;
  isGlobal: boolean;
}

export const deleteTask = createAsyncThunk<
  { id: string; isGlobal: boolean },
  DeleteTaskPayload,
  { rejectValue: string; state: RootState }
>("tasks/deleteTask", async ({ id, isGlobal }, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    const endpoint = isGlobal ? "global" : "private";
    
    const response = await fetch(`${API_URL}/task/${endpoint}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${isGlobal ? 'global' : 'private'} task`);
    }

    return { id, isGlobal };
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

// Slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Global Tasks
      .addCase(fetchGlobalTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.globalTasks = action.payload;
      })
      .addCase(fetchGlobalTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch global tasks";
      })
      
      // Fetch Private Tasks
      .addCase(fetchPrivateTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrivateTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.privateTasks = action.payload;
      })
      .addCase(fetchPrivateTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch private tasks";
      })
      
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isGlobal) {
          state.globalTasks.push(action.payload);
        } else {
          state.privateTasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create task";
      })
      
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isGlobal) {
          state.globalTasks = state.globalTasks.map(task => 
            task._id === action.payload._id ? action.payload : task
          );
        } else {
          state.privateTasks = state.privateTasks.map(task => 
            task._id === action.payload._id ? action.payload : task
          );
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update task";
      })
      
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isGlobal) {
          state.globalTasks = state.globalTasks.filter(
            task => task._id !== action.payload.id
          );
        } else {
          state.privateTasks = state.privateTasks.filter(
            task => task._id !== action.payload.id
          );
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete task";
      });
  },
});

export const { clearTaskErrors } = taskSlice.actions;
export default taskSlice.reducer;

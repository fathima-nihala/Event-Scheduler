import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../redux/store";

interface User {
  _id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  users: User[];
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  users: [],
  token: localStorage.getItem("token") || null,
};

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value};path=/`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=;path=/`;
};

const API_URL = import.meta.env?.VITE_API_URL;

export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }
    return (await response.json()).user;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    return await response.json();
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      localStorage.removeItem("token");
      removeCookie("token");

      return true;
    } catch (error) {
      const typedError = error as Error;
      return rejectWithValue(typedError.message);
    }
  }
);

export const getUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string; state: RootState }
>("auth/getUserProfile", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

interface UsersResponse {
  success: boolean;
  message: string;
  length: number;
  users: User[];
}


export const getAllUsers = createAsyncThunk<
  UsersResponse,
  void,
  { rejectValue: string; state: RootState }
>("auth/getAllUsers", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token || localStorage.getItem("token");
    console.log(
      "Fetching all users with token:",
      token ? "Present" : "Missing"
    );

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_URL}/auth/all-users`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log the response status
    console.log("Users API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text");
      console.error("User API error:", errorText);
      throw new Error(`Access Denied! Only admins can perform this action: ${response.status}`);
    }

    const data = await response.json();
    console.log("Users API data received:", data);
    return data;
  } catch (error) {
    const typedError = error as Error;
    console.error("getAllUsers error:", typedError.message);
    return rejectWithValue(typedError.message);
  }
});

export const makeAdmin = createAsyncThunk<
  User,
  string,
  { rejectValue: string, dispatch: AppDispatch }
>("auth/makeAdmin", async (userId, { rejectWithValue, dispatch }) => {
  try {
    const response = await fetch(`${API_URL}/auth/user/${userId}/make-admin`, {
      method: "PUT",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to make admin");
    }

    return await response.json();
    dispatch(getAllUsers());
  } catch (error) {
    const typedError = error as Error;
    return rejectWithValue(typedError.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.token = null;
      localStorage.removeItem("token");
      removeCookie("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Login Response:", action.payload);
        if (action.payload?.token && action.payload?.user) {
          localStorage.setItem("token", action.payload.token);
          setCookie("token", action.payload.token);
          state.token = action.payload.token;
          state.user = action.payload.user;
        } else {
          console.error("Login failed: No token or user received");
        }
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        console.log("Users loaded into state:", action.payload);
        state.loading = false;

        // Ensure we're properly extracting the users array
        if (action.payload && Array.isArray(action.payload.users)) {
          state.users = action.payload.users;
        } else {
          console.error("Invalid users data format:", action.payload);
          state.users = [];
          state.error = "Invalid data format received";
        }
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        console.error("getAllUsers rejected:", action.payload);
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
        state.users = [];
      })
      .addCase(makeAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

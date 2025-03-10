import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define Task Interface
interface Task {
    task: string;
    duration?: number;
    dependencies?: string[];
}

// Define Event Interface
interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    metadata?: Record<string, any>;
    tasks: Task[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}


// Define State Interface
interface EventState {
    events: Event[];
    event: Event | null;
    loading: boolean;
    error: string | null;
}

// Initial State
const initialState: EventState = {
    events: [],
    event: null,
    loading: false,
    error: null,
};

// API URL from Environment Variable
const API_URL = import.meta.env?.VITE_API_URL;

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};


export const fetchEvents = createAsyncThunk<Event[], void, { rejectValue: string }>(
    "events/fetchEvents",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/event`, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error("Failed to fetch events");

            const data = await response.json();

            if (!data.events || !Array.isArray(data.events)) {
                throw new Error("Invalid data format: events should be an array");
            }

            return data.events; // Ensure we return an array
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);


export const getEventById = createAsyncThunk<Event, string, { rejectValue: string }>(
    "events/getEventById",
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/event/${eventId}`, {
                method: "GET",
                headers: getAuthHeaders(), 
            });
            if (!response.ok) throw new Error("Failed to fetch event details");
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createEvent = createAsyncThunk<
    Event,
    { title: string; description: string; date: string; metadata?: Record<string, any> },
    { rejectValue: string }
>("events/createEvent", async (eventData, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_URL}/event`, {
            method: "POST",
            body: JSON.stringify(eventData),
            headers: getAuthHeaders(), 
        });

        if (!response.ok) throw new Error("Failed to create event");
        return await response.json();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const deleteEvent = createAsyncThunk<string, string, { rejectValue: string }>(
    "events/deleteEvent",
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/event/${eventId}`, {
                method: "DELETE",
                headers: getAuthHeaders(), 
            });
            if (!response.ok) throw new Error("Failed to delete event");
            return eventId;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateEvent = createAsyncThunk<Event, { eventId: string; eventData: Partial<Event> }, { rejectValue: string }>(
    "events/updateEvent",
    async ({ eventId, eventData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/event/${eventId}`, {
                method: "PUT",
                body: JSON.stringify(eventData),
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error("Failed to update event");
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const eventSlice = createSlice({
    name: "events",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Events
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch events";
            })

            // Get Event by ID
            .addCase(getEventById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getEventById.fulfilled, (state, action: PayloadAction<Event>) => {
                state.loading = false;
                state.event = action.payload;
            })
            .addCase(getEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch event details";
            })

            // Create Event
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
                state.loading = false;
                state.events.push(action.payload);
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create event";
            })

            // Delete Event
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.events = state.events.filter((event) => event._id !== action.payload);
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete event";
            })
            .addCase(updateEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
                state.loading = false;
                state.events = state.events.map((event) => event._id === action.payload._id ? action.payload : event);
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update event";
            });
    },
});

export default eventSlice.reducer;

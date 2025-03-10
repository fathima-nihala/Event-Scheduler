import React, { useEffect, useState } from "react";
import {
    Box, Card, Typography, CircularProgress, Alert, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Grid
} from "@mui/material";
import { DashboardContent } from "../../layouts/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, deleteEvent, updateEvent, createEvent } from "../../slices/eventSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { useSnackbar } from "notistack";

// Event interface
interface IEvent {
    _id?: string;
    title: string;
    description: string;
    date: string;
}

const EventPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { events, loading, error } = useSelector((state: RootState) => state.events);
    const { enqueueSnackbar } = useSnackbar();

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [eventData, setEventData] = useState<IEvent>({ title: "", description: "", date: "" });

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    const handleDeleteEvent = async (eventId: string) => {
        await dispatch(deleteEvent(eventId));
        enqueueSnackbar("Event deleted successfully!", { variant: "success" });
        await dispatch(fetchEvents());
    };

    const handleEditEvent = (event: IEvent) => {
        setEventData(event);
        setOpenEditDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenEditDialog(false);
        setOpenAddDialog(false);
        setEventData({ title: "", description: "", date: "" });
    };

    const handleSaveEvent = async () => {
        if (eventData._id) {
            await dispatch(updateEvent({ eventId: eventData._id, eventData }));
            enqueueSnackbar("Event updated successfully!", { variant: "success" });
        } else {
            await dispatch(createEvent(eventData));
            enqueueSnackbar("Event added successfully!", { variant: "success" });
        }
        await dispatch(fetchEvents()); 
        handleCloseDialog();
    };

    return (
        <DashboardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
                <Typography variant="h4">Events</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
                    Add Event
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Grid container spacing={3}>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <Grid item xs={12} sm={6} md={4} key={event._id}>
                                <Card sx={{ p: 3, boxShadow: 3 }}>
                                    <Typography variant="h6">{event.title}</Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        {event.description}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {new Date(event.date).toLocaleDateString()}
                                    </Typography>
                                    <Box mt={2} display="flex" justifyContent="space-between">
                                        <Button variant="contained" color="secondary" onClick={() => handleDeleteEvent(event._id)}>
                                            Delete
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={() => handleEditEvent(event)}>
                                            Edit
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No events found.</Typography>
                    )}
                </Grid>
            )}

            {/* Add/Edit Event Dialog */}
            <Dialog open={openEditDialog || openAddDialog} onClose={handleCloseDialog}>
                <DialogTitle>{eventData._id ? "Edit Event" : "Add Event"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        value={eventData.title}
                        onChange={(e) => setEventData((prev) => ({ ...prev, title: e.target.value }))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        value={eventData.description}
                        onChange={(e) => setEventData((prev) => ({ ...prev, description: e.target.value }))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Date"
                        type="date"
                        value={eventData.date ? eventData.date.split("T")[0] : ""}
                        onChange={(e) => setEventData((prev) => ({ ...prev, date: e.target.value }))}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveEvent} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar autoHideDuration={3000} />
        </DashboardContent>
    );
};

export default EventPage;

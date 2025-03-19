import React, { useState, useEffect } from "react";
import {
  Box, Button, Chip, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, Card
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { DashboardContent } from "../../../layouts/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { fetchGlobalTasks, fetchPrivateTasks, deleteTask } from "../../../slices/taskSlice";
import { useSnackbar } from "notistack";
import SearchField from "./SearchField";
import TaskDialog from "./TaskDialog";

interface TimingInfo {
  relation: "before" | "after" | "start" | "end";
  offset: number;
  unit: "minutes" | "hours" | "seconds";
}

type Task = any;

interface TaskItem {
  _id: string;
  description: string;
  duration: number;
  dependencies: TaskItem[] | string[];
  timing: TimingInfo;
  isGlobal: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function TaskView() {
  const dispatch = useDispatch<AppDispatch>();
  const { globalTasks, privateTasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Search state
  const [globalSearch, setGlobalSearch] = useState("");
  const [privateSearch, setPrivateSearch] = useState("");

  useEffect(() => {
    dispatch(fetchGlobalTasks());
    dispatch(fetchPrivateTasks());
  }, [dispatch]);

  // Search handlers
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearch(e.target.value);
  };

  const handlePrivateSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateSearch(e.target.value);
  };

  const clearGlobalSearch = () => {
    setGlobalSearch("");
  };

  const clearPrivateSearch = () => {
    setPrivateSearch("");
  };

  // Filter tasks based on search terms
  const filteredGlobalTasks = globalTasks.filter((task: Task) =>
    task.description.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredPrivateTasks = privateTasks.filter((task: Task) =>
    task.description.toLowerCase().includes(privateSearch.toLowerCase())
  );

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task ? { ...task } : null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDelete = (task: Task) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask({ id: task._id, isGlobal: task.isGlobal }))
        .then(() => enqueueSnackbar("Task deleted successfully", { variant: "success" }))
        .catch(() => enqueueSnackbar("Failed to delete task", { variant: "error" }));
    }
  };

  const formatTiming = (timing: TimingInfo): string => {
    return `${timing.relation} ${timing.offset} ${timing.unit || 'minutes'}`;
  };

  const formatDuration = (duration: number): string => {
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  const canManageGlobal = user?.isAdmin;

  const renderTaskRow = (task: Task) => (
    <TableRow key={task._id}>
      <TableCell>{task.description}</TableCell>
      <TableCell>{formatDuration(task.duration)}</TableCell>
      <TableCell>{formatTiming(task.timing)}</TableCell>
      <TableCell>
        {task.dependencies.length > 0
          ? task.dependencies.map((dep: any, index: number) => (
            <Chip key={index} label={dep.description || dep} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))
          : "None"}
      </TableCell>
      <TableCell>
        {(canManageGlobal || !task.isGlobal) && (
          <>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpenDialog(task)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete(task)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Task
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Card sx={{ mb: 4 }}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Global Tasks</Typography>
          <SearchField value={globalSearch} onChange={handleGlobalSearchChange} onClear={clearGlobalSearch} placeholder="Search global tasks..." />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Dependencies</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow> : filteredGlobalTasks.map(renderTaskRow)}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      <Card>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Your Private Tasks</Typography>
          <SearchField value={privateSearch} onChange={handlePrivateSearchChange} onClear={clearPrivateSearch} placeholder="Search private tasks..." />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Dependencies</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow> : filteredPrivateTasks.map(renderTaskRow)}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      <TaskDialog open={openDialog} onClose={handleCloseDialog} task={editingTask} isAdmin={user?.isAdmin} />
    </DashboardContent>
  );
}

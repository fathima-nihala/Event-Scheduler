import { useState, useEffect } from "react";
import { Box, Button, Chip, IconButton, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import { Card, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, FormHelperText } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { DashboardContent } from "../../../layouts/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { 
  fetchGlobalTasks, 
  fetchPrivateTasks, 
  createTask, 
  updateTask, 
  deleteTask 
} from "../../../slices/taskSlice";
import { useSnackbar } from "notistack";


interface TimingInfo {
  relation: "before" | "after" | "start" | "end";
  offset: number;
  unit: "minutes" | "hours" | "seconds";
}

// Using type imports to handle existing Task type from Redux store
type Task = any; 

// Our local interface definition
interface TaskItem {
  _id: string;
  description: string;
  duration: number; // Duration in hours
  dependencies: TaskItem[] | string[];
  timing: TimingInfo;
  isGlobal: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define interface for form values
interface FormValues {
  description: string;
  duration: number;
  'timing.relation': 'before' | 'after' | 'start' | 'end';
  'timing.offset': number;
  'timing.unit': 'minutes' | 'hours' | 'seconds';
  isGlobal: boolean;
}

// Define interface for form errors
interface FormErrors {
  description?: string;
  duration?: string;
  'timing.offset'?: string;
}

// Define interface for task creation/update data
interface TaskData {
  description: string;
  duration: number;
  timing: TimingInfo;
  isGlobal: boolean;
  dependencies: string[];
}

export function TaskView() {
  const dispatch = useDispatch<AppDispatch>();
  const { globalTasks, privateTasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    description: "",
    duration: 0,
    "timing.relation": "after",
    "timing.offset": 0,
    "timing.unit": "minutes",
    isGlobal: false
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    dispatch(fetchGlobalTasks());
    dispatch(fetchPrivateTasks());
  }, [dispatch]);

  // Convert Task from Redux to our TaskItem interface
  const convertToTaskItem = (task: Task): TaskItem => {
    return {
      _id: task._id,
      description: task.description,
      duration: task.duration,
      dependencies: task.dependencies,
      timing: task.timing,
      isGlobal: task.isGlobal,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  };

  const handleOpenDialog = (task: Task | null = null) => {
    if (task) {
      const taskItem = convertToTaskItem(task);
      setEditingTask(taskItem);
      setFormValues({
        description: taskItem.description,
        duration: taskItem.duration,
        "timing.relation": taskItem.timing.relation,
        "timing.offset": taskItem.timing.offset,
        "timing.unit": taskItem.timing.unit || "minutes", // Use the unit from the task or default to minutes
        isGlobal: taskItem.isGlobal
      });
    } else {
      setEditingTask(null);
      setFormValues({
        description: "",
        duration: 0,
        "timing.relation": "after",
        "timing.offset": 0,
        "timing.unit": "minutes",
        isGlobal: false
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formValues.description.trim()) {
      errors.description = "Description is required";
    }
    if (formValues.duration <= 0) {
      errors.duration = "Duration must be greater than 0";
    }
    if (formValues["timing.offset"] < 0) {
      errors["timing.offset"] = "Offset cannot be negative";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskData: TaskData = {
      description: formValues.description,
      duration: formValues.duration, // Duration in hours
      timing: {
        relation: formValues["timing.relation"],
        offset: formValues["timing.offset"],
        unit: formValues["timing.unit"]
      },
      isGlobal: formValues.isGlobal,
      dependencies: []
    };

    if (editingTask) {
      dispatch(updateTask({
        id: editingTask._id,
        taskData,
        isGlobal: editingTask.isGlobal
      }))
      .then(() => enqueueSnackbar("Task updated successfully", { variant: "success" }))
      .catch(() => enqueueSnackbar("Failed to update task", { variant: "error" }));
    } else {
      dispatch(createTask({
        taskData,
        isGlobal: formValues.isGlobal
      }))
      .then(() => enqueueSnackbar("Task created successfully", { variant: "success" }))
      .catch(() => enqueueSnackbar("Failed to create task", { variant: "error" }));
    }

    handleCloseDialog();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormValues(prev => ({
        ...prev,
        [name]: name === "isGlobal" ? value === "true" : 
                name === "duration" ? Number(value) : 
                name === "timing.offset" ? Number(value) : value
      }));
    }
  };

  const handleDelete = (task: Task) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask({
        id: task._id,
        isGlobal: task.isGlobal
      }))
      .then(() => enqueueSnackbar("Task deleted successfully", { variant: "success" }))
      .catch(() => enqueueSnackbar("Failed to delete task", { variant: "error" }));
    }
  };

  // Helper function to format timing display
  const formatTiming = (timing: TimingInfo): string => {
    return `${timing.relation} ${timing.offset} ${timing.unit}`;
  };

  // Helper function to format duration display
  const formatDuration = (duration: number): string => {
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  const canManageGlobal = user?.isAdmin;

  // Type guard to check if dependency is a string or an object
  const getDependencyLabel = (dep: any): string => {
    return typeof dep === 'string' ? dep : dep.description;
  };

  // Type guard to get a unique key for dependency
  const getDependencyKey = (dep: any, index: number): string => {
    return typeof dep === 'string' ? dep : dep._id || `dep-${index}`;
  };

  // Render a single task row
  const renderTaskRow = (task: Task) => (
    <TableRow key={task._id}>
      <TableCell>{task.description}</TableCell>
      <TableCell>{formatDuration(task.duration)}</TableCell>
      <TableCell>
        {formatTiming(task.timing)}
      </TableCell>
      <TableCell>
        {task.dependencies && task.dependencies.length > 0 ? (
          Array.isArray(task.dependencies) && task.dependencies.map((dep: any, index: number) => (
            <Chip 
              key={getDependencyKey(dep, index)} 
              label={getDependencyLabel(dep)} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }} 
            />
          ))
        ) : (
          "None"
        )}
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
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Card sx={{ mb: 4 }}>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Global Tasks</Typography>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Loading...</TableCell>
                  </TableRow>
                ) : globalTasks.length > 0 ? (
                  globalTasks.map((task: Task) => renderTaskRow(task))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No global tasks found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      <Card>
        <Box p={3}>
          <Typography variant="h6" mb={2}>Your Private Tasks</Typography>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Loading...</TableCell>
                  </TableRow>
                ) : privateTasks.length > 0 ? (
                  privateTasks.map((task: Task) => renderTaskRow(task))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No private tasks found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
            
            <TextField
              fullWidth
              label="Duration (hours)"
              name="duration"
              type="number"
              value={formValues.duration}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors.duration}
              helperText={formErrors.duration || "Task duration in hours"}
              inputProps={{ step: 0.5 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Timing Relation</InputLabel>
              <Select
                name="timing.relation"
                value={formValues["timing.relation"]}
                onChange={handleChange}
                label="Timing Relation"
              >
                <MenuItem value="before">Before</MenuItem>
                <MenuItem value="after">After</MenuItem>
                <MenuItem value="start">Start</MenuItem>
                <MenuItem value="end">End</MenuItem>
              </Select>
              <FormHelperText>When should this task occur relative to its dependencies</FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              label="Timing Offset"
              name="timing.offset"
              type="number"
              value={formValues["timing.offset"]}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors["timing.offset"]}
              helperText={formErrors["timing.offset"]}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Offset Unit</InputLabel>
              <Select
                name="timing.unit"
                value={formValues["timing.unit"]}
                onChange={handleChange}
                label="Offset Unit"
              >
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="seconds">Seconds</MenuItem>
              </Select>
              <FormHelperText>Unit for the offset value</FormHelperText>
            </FormControl>
            
            {user?.isAdmin && !editingTask && (
             <FormControl fullWidth margin="normal">
             <InputLabel>Task Type</InputLabel>
             <Select
               name="isGlobal"
               value={formValues.isGlobal ? "true" : "false"}
               onChange={handleChange}
               label="Task Type"
             >
               <MenuItem value="false">Private Task</MenuItem>
               <MenuItem value="true">Global Task</MenuItem>
             </Select>
           </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
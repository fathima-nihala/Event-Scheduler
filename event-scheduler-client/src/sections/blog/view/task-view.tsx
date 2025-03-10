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
}

// Define interface for form values
interface FormValues {
  description: string;
  duration: number;
  'timing.relation': 'before' | 'after' | 'start' | 'end';
  'timing.offset': number;
  isGlobal: boolean;
}

// Define interface for form errors
interface FormErrors {
  description?: string;
  duration?: string;
}

// Define interface for task creation/update data - matches the expected types in the slice
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    description: "",
    duration: 0,
    "timing.relation": "after",
    "timing.offset": 0,
    isGlobal: false
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    dispatch(fetchGlobalTasks());
    dispatch(fetchPrivateTasks());
  }, [dispatch]);

  const handleOpenDialog = (task: Task | null = null) => {
    if (task) {
      setEditingTask(task);
      setFormValues({
        description: task.description,
        duration: task.duration,
        "timing.relation": task.timing.relation,
        "timing.offset": task.timing.offset,
        isGlobal: task.isGlobal
      });
    } else {
      setEditingTask(null);
      setFormValues({
        description: "",
        duration: 0,
        "timing.relation": "after",
        "timing.offset": 0,
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskData: TaskData = {
      description: formValues.description,
      duration: formValues.duration,
      timing: {
        relation: formValues["timing.relation"],
        offset: formValues["timing.offset"]
      },
      isGlobal: formValues.isGlobal,
      dependencies: []
    };

    if (editingTask) {
      dispatch(updateTask({
        id: editingTask._id,
        taskData,
        isGlobal: editingTask.isGlobal
      }));
    } else {
      dispatch(createTask({
        taskData,
        isGlobal: formValues.isGlobal
      }));
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
        [name]: name === "isGlobal" ? value === "true" : value
      }));
    }
  };

  const handleDelete = (task: Task) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask({
        id: task._id,
        isGlobal: task.isGlobal
      }));
    }
  };

  const canManageGlobal = user?.isAdmin;

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
                  globalTasks.map((task: Task) => (
                    <TableRow key={task._id}>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.duration} mins</TableCell>
                      <TableCell>
                        {task.timing.relation} {task.timing.offset} mins
                      </TableCell>
                      <TableCell>
                        {task.dependencies && task.dependencies.length > 0 ? (
                          Array.isArray(task.dependencies) && task.dependencies.map((dep, index) => (
                            <Chip 
                              key={typeof dep === 'string' ? dep : dep._id || index} 
                              label={typeof dep === 'string' ? dep : dep.description} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell>
                        {canManageGlobal && (
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
                  ))
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
                  privateTasks.map((task: Task) => (
                    <TableRow key={task._id}>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.duration} mins</TableCell>
                      <TableCell>
                        {task.timing.relation} {task.timing.offset} mins
                      </TableCell>
                      <TableCell>
                        {task.dependencies && task.dependencies.length > 0 ? (
                          Array.isArray(task.dependencies) && task.dependencies.map((dep, index) => (
                            <Chip 
                              key={typeof dep === 'string' ? dep : dep._id || index} 
                              label={typeof dep === 'string' ? dep : dep.description} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))
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
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formValues.duration}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors.duration}
              helperText={formErrors.duration}
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
              label="Timing Offset (minutes)"
              name="timing.offset"
              type="number"
              value={formValues["timing.offset"]}
              onChange={handleChange}
              margin="normal"
            />
            
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
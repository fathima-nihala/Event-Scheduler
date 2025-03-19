import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  SelectChangeEvent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Checkbox,
  ListItemText,
  OutlinedInput
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { createTask, updateTask, fetchGlobalTasks, fetchPrivateTasks } from "../../../slices/taskSlice";
import { useSnackbar } from "notistack";

// Types
interface TimingInfo {
  relation: "before" | "after" | "start" | "end";
  offset: number;
  unit: "minutes" | "hours" | "seconds";
}

interface TaskItem {
  _id: string;
  description: string;
  duration: number;
  dependencies: any[] | string[];
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
  dependencies: string[];
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

// Task Dialog Component Props
interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: TaskItem | null;
  isAdmin?: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ open, onClose, task, isAdmin }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState<FormValues>({
    description: "",
    duration: 0,
    "timing.relation": "after",
    "timing.offset": 0,
    "timing.unit": "minutes",
    isGlobal: false,
    dependencies: []
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Get tasks from Redux store for dependency selection
  const { globalTasks, privateTasks } = useSelector(
    (state: RootState) => state.tasks
  );
  
  // Fetch tasks when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchGlobalTasks());
      dispatch(fetchPrivateTasks());
    }
  }, [dispatch, open]);
  
  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setFormValues({
        description: task.description,
        duration: task.duration,
        "timing.relation": task.timing.relation,
        "timing.offset": task.timing.offset,
        "timing.unit": task.timing.unit || "minutes",
        isGlobal: task.isGlobal,
        dependencies: Array.isArray(task.dependencies) 
          ? task.dependencies.map(dep => typeof dep === 'string' ? dep : dep._id)
          : []
      });
    } else {
      // Reset form for new task
      setFormValues({
        description: "",
        duration: 0,
        "timing.relation": "after",
        "timing.offset": 0,
        "timing.unit": "minutes",
        isGlobal: false,
        dependencies: []
      });
    }
    setFormErrors({});
  }, [task]);

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
      duration: formValues.duration,
      timing: {
        relation: formValues["timing.relation"],
        offset: formValues["timing.offset"],
        unit: formValues["timing.unit"]
      },
      isGlobal: formValues.isGlobal,
      dependencies: formValues.dependencies
    };

    if (task) {
      dispatch(updateTask({
        id: task._id,
        taskData,
        isGlobal: task.isGlobal
      }))
      .then(() => {
        enqueueSnackbar("Task updated successfully", { variant: "success" });
        onClose();
      })
      .catch(() => enqueueSnackbar("Failed to update task", { variant: "error" }));
    } else {
      dispatch(createTask({
        taskData,
        isGlobal: formValues.isGlobal
      }))
      .then(() => {
        enqueueSnackbar("Task created successfully", { variant: "success" });
        onClose();
      })
      .catch(() => enqueueSnackbar("Failed to create task", { variant: "error" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormValues(prev => ({
        ...prev,
        [name]: name === "isGlobal" ? value === "true" : 
                name === "duration" ? Number(value) : 
                name === "timing.offset" ? Number(value) : 
                name === "dependencies" ? value : value
      }));
    }
  };

  // Get available tasks for dependencies, excluding current task and ensuring no circular dependencies
  const getAvailableTasks = () => {
    const allTasks = [...globalTasks, ...privateTasks];
    // Filter out the current task to prevent self-dependency
    return allTasks.filter(t => !task || t._id !== task._id);
  };

  // Get task description by ID for display
  const getTaskDescription = (taskId: string) => {
    const allTasks = [...globalTasks, ...privateTasks];
    const foundTask = allTasks.find(t => t._id === taskId);
    return foundTask ? foundTask.description : "Unknown Task";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
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
            <InputLabel>Dependencies</InputLabel>
            <Select
              name="dependencies"
              multiple
              value={formValues.dependencies}
              onChange={handleChange}
              input={<OutlinedInput label="Dependencies" />}
              renderValue={(selected) => {
                const selectedArr = selected as string[];
                return selectedArr.map(id => getTaskDescription(id)).join(", ");
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 224,
                    width: 250,
                  },
                },
              }}
            >
              {getAvailableTasks().map((availableTask) => (
                <MenuItem key={availableTask._id} value={availableTask._id}>
                  <Checkbox 
                    checked={formValues.dependencies.indexOf(availableTask._id) > -1} 
                  />
                  <ListItemText 
                    primary={availableTask.description} 
                    secondary={availableTask.isGlobal ? "Global Task" : "Private Task"}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select tasks this task depends on</FormHelperText>
          </FormControl>
          
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
          
          {isAdmin && !task && (
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
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {task ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;


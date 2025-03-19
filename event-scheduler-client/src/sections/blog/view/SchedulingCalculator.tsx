import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { format } from "date-fns";

interface Task {
  _id: string;
  description: string;
  duration: number;
  dependencies: string[];
  timing: {
    relation: "before" | "after" | "start" | "end";
    offset: number;
    unit: "minutes" | "hours" | "seconds";
  };
  startDate?: Date;
  isGlobal: boolean;
  userId?: string;
}

interface ScheduledTask {
  taskId: string;
  description: string;
  startTime: Date;
  endTime: Date;
  dependencies: string[];
  estimatedCompletionTime?: Date;
}

const SchedulingCalculator: React.FC = () => {
  const [eventDate, setEventDate] = useState<Date | null>(new Date());
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduledTask[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [earliestStart, setEarliestStart] = useState<Date | null>(null);
  const [latestEnd, setLatestEnd] = useState<Date | null>(null);

  const { globalTasks, privateTasks } = useSelector((state: RootState) => state.tasks);
  const allTasks = [...globalTasks, ...privateTasks];

  const handleTaskSelection = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTasks(typeof value === "string" ? value.split(",") : value);
  };

  const calculateSchedule = () => {
    if (!eventDate || selectedTasks.length === 0) return;

    const tasksToSchedule = selectedTasks
      .map((taskId) => allTasks.find((task) => task._id === taskId))
      .filter((task): task is Task => task !== undefined);

    const taskMap = new Map<string, Task>();
    tasksToSchedule.forEach(task => taskMap.set(task._id, task));

    const visited = new Set<string>();
    const temporaryMark = new Set<string>();
    const executionOrder: Task[] = [];

    const visitTask = (taskId: string): void => {
      if (visited.has(taskId)) return;
      if (temporaryMark.has(taskId)) {
        alert("Circular dependency detected in tasks. Please check your task dependencies.");
        return;
      }

      temporaryMark.add(taskId);
      const task = taskMap.get(taskId);
      if (task) {
        task.dependencies.forEach((depId) => {
          if (taskMap.has(depId)) {
            visitTask(depId);
          }
        });
      }
      temporaryMark.delete(taskId);
      visited.add(taskId);
      if (task) executionOrder.unshift(task);
    };

    tasksToSchedule.forEach(task => {
      if (!visited.has(task._id)) {
        visitTask(task._id);
      }
    });

    const scheduledTasks: ScheduledTask[] = [];
    const taskEndTimes = new Map<string, Date>();

    executionOrder.forEach(task => {
      let startTime = task.startDate ? new Date(task.startDate) : new Date(eventDate);

      if (task.dependencies.length > 0) {
        const dependencyEndTimes = task.dependencies
          .map(depId => taskEndTimes.get(depId))
          .filter((time): time is Date => time !== undefined);
        
        if (dependencyEndTimes.length > 0) {
          startTime = new Date(Math.max(...dependencyEndTimes.map(date => date.getTime())));
        }
      }

      // Apply timing offsets
      let offset = task.timing.offset || 0;
      const unit = task.timing.unit || 'minutes';
      let multiplier = 60 * 1000; // minutes to milliseconds

      if (unit === 'hours') {
        multiplier = 60 * 60 * 1000;
      } else if (unit === 'seconds') {
        multiplier = 1000;
      }

      if (task.timing.relation === 'before') {
        offset = -offset; // Negative for 'before'
      }

      // Apply the offset
      startTime = new Date(startTime.getTime() + (offset * multiplier));

      const durationMs = task.duration * 60 * 60 * 1000; // hours to milliseconds
      const endTime = new Date(startTime.getTime() + durationMs);
      taskEndTimes.set(task._id, endTime);

      scheduledTasks.push({
        taskId: task._id,
        description: task.description,
        startTime,
        endTime,
        dependencies: task.dependencies,
        estimatedCompletionTime: endTime
      });
    });

    scheduledTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (scheduledTasks.length > 0) {
      const earliest = new Date(Math.min(...scheduledTasks.map(task => task.startTime.getTime())));
      const latest = new Date(Math.max(...scheduledTasks.map(task => task.endTime.getTime())));
      setEarliestStart(earliest);
      setLatestEnd(latest);
      setTotalDuration(Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60)));
    }

    setSchedule(scheduledTasks);
  };

  const resetCalculator = () => {
    setEventDate(new Date());
    setSelectedTasks([]);
    setSchedule([]);
    setTotalDuration(0);
    setEarliestStart(null);
    setLatestEnd(null);
  };

  const getTaskDescription = (taskId: string) => {
    const task = allTasks.find(t => t._id === taskId);
    return task ? task.description : "Unknown Task";
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Task Scheduling Calculator
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Event Date & Time"
              value={eventDate}
              onChange={(newValue) => setEventDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel id="task-selection-label">Select Tasks</InputLabel>
            <Select
              labelId="task-selection-label"
              multiple
              value={selectedTasks}
              onChange={handleTaskSelection}
              renderValue={(selected) => selected.map(id => getTaskDescription(id)).join(", ")}
            >
              {allTasks.map((task) => (
                <MenuItem key={task._id} value={task._id}>
                  {task.description} ({task.isGlobal ? "Global" : "Private"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="space-between">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={calculateSchedule}
              disabled={!eventDate || selectedTasks.length === 0}
            >
              Calculate Schedule
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={resetCalculator}
            >
              Reset
            </Button>
          </Box>

          {schedule.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>Scheduling Results</Typography>
              
              <Box mb={2}>
                <Typography><strong>Total Duration:</strong> {totalDuration} hours</Typography>
                <Typography><strong>Earliest Start:</strong> {earliestStart && format(earliestStart, 'PPpp')}</Typography>
                <Typography><strong>Latest End:</strong> {latestEnd && format(latestEnd, 'PPpp')}</Typography>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Estimated Completion Time</TableCell>
                      <TableCell>Dependencies</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((task) => (
                      <TableRow key={task.taskId}>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{format(task.startTime, 'PPpp')}</TableCell>
                        <TableCell>{format(task.endTime, 'PPpp')}</TableCell>
                        <TableCell>{task.estimatedCompletionTime && format(task.estimatedCompletionTime, 'PPpp')}</TableCell>
                        <TableCell>
                          {task.dependencies.length > 0 
                            ? task.dependencies.map(depId => getTaskDescription(depId)).join(", ")
                            : "None"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SchedulingCalculator;
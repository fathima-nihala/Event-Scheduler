const Task = require("../Models/taskModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const errorHandler = require("../middlewares/errorHandler");

// Create Global Task (Admin only)
exports.createGlobalTask = catchAsyncError(async (req, res, next) => {
    try {

        const { description, duration, dependencies, timing } = req.body;
        const task = new Task({ description, duration, dependencies, startDate, timing, isGlobal: true });
        await task.save();
        
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Global Task Created",
            task
        });
    } catch (error) {
        next(error);
    }
});

// Get All Global Tasks
exports.getAllGlobalTasks = catchAsyncError(async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { isGlobal: true };
        if (search) {
            query.description = { $regex: search, $options: "i" };
        }

        const tasks = await Task.find(query).populate("dependencies", "description");

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Global Tasks Fetched",
            tasks
        });
    } catch (error) {
        next(error);
    }
});

// Update Global Task
exports.updateGlobalTask = catchAsyncError(async (req, res, next) => {
    try {

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedTask) {
            return next(new errorHandler("Task not found", 404));
        }

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Global Task Updated",
            updatedTask
        });
    } catch (error) {
        next(error);
    }
});

// Delete Global Task
exports.deleteGlobalTask = catchAsyncError(async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return next(new errorHandler("Task not found", 404));
        }

        await task.deleteOne();

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Global Task Deleted"
        });
    } catch (error) {
        next(error);
    }
});

//--------------------------------------------private tasks---------------------------

// Create Private Task
exports.createPrivateTask = catchAsyncError(async (req, res, next) => {
    try {
        const { description, duration, dependencies, timing, startDate  } = req.body;
        const task = new Task({ 
            description, 
            duration, 
            dependencies, 
            timing, 
            startDate ,
            isGlobal: false, 
            userId: req.user._id 
        });
        await task.save();

        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Private Task Created",
            task
        });
    } catch (error) {
        next(error);
    }
});

// Get User's Private Tasks
exports.getUserPrivateTasks = catchAsyncError(async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { userId: req.user.id, isGlobal: false };
        if (search) {
            query.description = { $regex: search, $options: "i" };
        }
        const tasks = await Task.find(query).populate("dependencies", "description");

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "User's Private Tasks Fetched",
            tasks
        });
    } catch (error) {
        next(error);
    }
});

// Update Private Task
exports.updatePrivateTask = catchAsyncError(async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

        if (!task) {
            return next(new errorHandler("Task not found", 404));
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Private Task Updated",
            updatedTask
        });
    } catch (error) {
        next(error);
    }
});

// Delete Private Task
exports.deletePrivateTask = catchAsyncError(async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

        if (!task) {
            return next(new errorHandler("Task not found", 404));
        }

        await task.deleteOne();

        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Private Task Deleted"
        });
    } catch (error) {
        next(error);
    }
});


// Calculate Schedule
exports.calculateSchedule = catchAsyncError(async (req, res, next) => {
    try {
        const { taskIds, eventDate } = req.body;
        
        if (!taskIds || !Array.isArray(taskIds) || !eventDate) {
            return next(new errorHandler("Invalid input: taskIds array and eventDate are required", 400));
        }
        
        // Fetch all tasks needed for calculation
        const tasks = await Task.find({
            _id: { $in: taskIds },
            $or: [
                { isGlobal: true },
                { userId: req.user.id, isGlobal: false }
            ]
        }).populate("dependencies");
        
        if (tasks.length === 0) {
            return next(new errorHandler("No valid tasks found", 404));
        }
        
        // Create a map of tasks for easy lookup
        const taskMap = new Map();
        tasks.forEach(task => taskMap.set(task._id.toString(), task));
        
        // Check if all required tasks are available
        const missingTasks = taskIds.filter(id => !taskMap.has(id.toString()));
        if (missingTasks.length > 0) {
            return next(new errorHandler(`Some tasks not found: ${missingTasks.join(', ')}`, 404));
        }
        
        // Detect circular dependencies
        const visited = new Set();
        const temporaryMark = new Set();
        const executionOrder = [];
        
        const detectCircular = (taskId, path = []) => {
            if (visited.has(taskId)) return false;
            if (temporaryMark.has(taskId)) {
                return [...path, taskId];
            }
            
            temporaryMark.add(taskId);
            path.push(taskId);
            
            const task = taskMap.get(taskId);
            if (task && task.dependencies.length > 0) {
                for (const dep of task.dependencies) {
                    const depId = dep._id ? dep._id.toString() : dep.toString();
                    if (taskMap.has(depId)) {
                        const circularPath = detectCircular(depId, [...path]);
                        if (circularPath) return circularPath;
                    }
                }
            }
            
            temporaryMark.delete(taskId);
            return false;
        };
        
        // Check for circular dependencies
        for (const taskId of taskMap.keys()) {
            const circularPath = detectCircular(taskId);
            if (circularPath) {
                return next(new errorHandler(`Circular dependency detected: ${circularPath.join(' -> ')}`, 400));
            }
        }
        
        // Calculate the execution order
        visited.clear();
        temporaryMark.clear();
        
        const visitTask = (taskId) => {
            if (visited.has(taskId)) return;
            if (temporaryMark.has(taskId)) return; // Already handled in circular detection
            
            temporaryMark.add(taskId);
            
            const task = taskMap.get(taskId);
            if (task && task.dependencies.length > 0) {
                for (const dep of task.dependencies) {
                    const depId = dep._id ? dep._id.toString() : dep.toString();
                    if (taskMap.has(depId)) {
                        visitTask(depId);
                    }
                }
            }
            
            temporaryMark.delete(taskId);
            visited.add(taskId);
            if (task) executionOrder.push(task);
        };
        
        // Build execution order
        for (const taskId of taskMap.keys()) {
            if (!visited.has(taskId)) {
                visitTask(taskId);
            }
        }
        
        // Calculate schedule
        const eventDateTime = new Date(eventDate);
        const scheduledTasks = [];
        const taskEndTimes = new Map();
        
        for (const task of executionOrder) {
            // Use specified start date if available, otherwise calculate based on dependencies
            let startTime;
            
            if (task.startDate) {
                // If task has a specific start date, use it
                startTime = new Date(task.startDate);
            } else {
                // Otherwise use event date as default
                startTime = new Date(eventDateTime);
                
                // If task has dependencies, start after the latest dependency end time
                if (task.dependencies.length > 0) {
                    const dependencyEndTimes = [];
                    
                    for (const dep of task.dependencies) {
                        const depId = dep._id ? dep._id.toString() : dep.toString();
                        if (taskEndTimes.has(depId)) {
                            dependencyEndTimes.push(taskEndTimes.get(depId));
                        }
                    }
                    
                    if (dependencyEndTimes.length > 0) {
                        startTime = new Date(Math.max(...dependencyEndTimes.map(date => date.getTime())));
                    }
                }
                
                // Apply timing offsets (unchanged)
                let offset = task.timing?.offset || 0;
                const unit = task.timing?.unit || 'minutes';
                let multiplier = 60 * 1000; // minutes to milliseconds
                
                if (unit === 'hours') {
                    multiplier = 60 * 60 * 1000;
                } else if (unit === 'days') {
                    multiplier = 24 * 60 * 60 * 1000;
                }
                
                // Calculate start time based on timing type
                if (task.timing?.relation === 'before') {
                    offset = -offset; // Negative for 'before'
                }
                
                // Apply the offset
                startTime = new Date(startTime.getTime() + (offset * multiplier));
            }
            
            // Calculate end time based on duration
            const durationMs = task.duration * 60 * 60 * 1000; // hours to milliseconds
            const endTime = new Date(startTime.getTime() + durationMs);
            taskEndTimes.set(task._id.toString(), endTime);
            
            scheduledTasks.push({
                taskId: task._id,
                description: task.description,
                startTime,
                endTime,
                duration: task.duration,
                isFixedStart: !!task.startDate // Flag to indicate if start time was fixed
            });
        }
        
        // Sort scheduled tasks by start time
        scheduledTasks.sort((a, b) => a.startTime - b.startTime);
        
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Schedule calculated successfully",
            eventDate: eventDateTime,
            schedule: scheduledTasks
        });
    } catch (error) {
        next(error);
    }
});
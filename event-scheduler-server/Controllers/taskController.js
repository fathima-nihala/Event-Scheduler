const Task = require("../Models/taskModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const errorHandler = require("../middlewares/errorHandler");

// Create Global Task (Admin only)
exports.createGlobalTask = catchAsyncError(async (req, res, next) => {
    try {

        const { description, duration, dependencies, timing } = req.body;
        const task = new Task({ description, duration, dependencies, timing, isGlobal: true });
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
        const { description, duration, dependencies, timing } = req.body;
        const task = new Task({ 
            description, 
            duration, 
            dependencies, 
            timing, 
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
        const tasks = await Task.find({ userId: req.user.id }).populate("dependencies", "description");

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

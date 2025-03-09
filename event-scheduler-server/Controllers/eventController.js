const Event = require("../Models/eventModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const errorHandler = require("../middlewares/errorHandler");

// Create a new event
exports.createEvent = catchAsyncError(async (req, res, next) => {
    const { title, description, date, metadata } = req.body;
  
    const existingEvent = await Event.findOne({ title });
    if (existingEvent) {
      return next(new errorHandler("Event with this title already exists", 400));
    }
  
    const event = new Event({ title, description, date, metadata });
    await event.save();
  
    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Event created successfully",
      event,
    });
  });
  
  // Retrieve all events
  exports.getAllEvents = catchAsyncError(async (req, res, next) => {
    const events = await Event.find().populate("tasks.task", "description");
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Events fetched successfully",
      events,
    });
  });
  
  // Retrieve a single event by ID
  exports.getEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate("tasks.task", "description");
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event fetched successfully",
      event,
    });
  });
  
  // Update an existing event
  exports.updateEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event updated successfully",
      event,
    });
  });
  
  // Delete an event
  exports.deleteEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
    await event.deleteOne();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Event deleted successfully",
    });
  });
  
  // Assign a task to an event
  exports.addTaskToEvent = catchAsyncError(async (req, res, next) => {
    const { taskId, duration, dependencies } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
  
    event.tasks.push({ task: taskId, duration, dependencies });
    await event.save();
  
    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Task added to event successfully",
      event,
    });
  });
  
  // Update a task assignment within an event (e.g., overriding duration or dependencies)
  exports.updateTaskInEvent = catchAsyncError(async (req, res, next) => {
    const { duration, dependencies } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
    
    const taskAssignment = event.tasks.id(req.params.taskId);
    if (!taskAssignment) {
      return next(new errorHandler("Task assignment not found", 404));
    }
  
    if (duration !== undefined) taskAssignment.duration = duration;
    if (dependencies !== undefined) taskAssignment.dependencies = dependencies;
    
    await event.save();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Task assignment updated successfully",
      event,
    });
  });
  
  // Remove a task from an event
  exports.removeTaskFromEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return next(new errorHandler("Event not found", 404));
    }
    
    const taskAssignment = event.tasks.id(req.params.taskId);
    if (!taskAssignment) {
      return next(new errorHandler("Task assignment not found", 404));
    }
  
    taskAssignment.remove();
    await event.save();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Task removed from event successfully",
      event,
    });
  });
  
const {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    addTaskToEvent,
    updateTaskInEvent,
    removeTaskFromEvent,
  } = require("../Controllers/eventController");
  const { authCheck } = require("../middlewares/authCheck");
  const router = require("express").Router();
  
  // Routes for events
  router
    .route("/")
    .post(authCheck, createEvent)   
    .get(authCheck, getAllEvents);   
  
  router
    .route("/:id")
    .get(authCheck, getEvent)        
    .put(authCheck, updateEvent)     
    .delete(authCheck, deleteEvent); 
  
  // Routes for task assignments within an event
  router
    .route("/:id/tasks")
    .post(authCheck, addTaskToEvent); // Assign a task to an event
  
  router
    .route("/:eventId/tasks/:taskId")
    .put(authCheck, updateTaskInEvent)   // Update task overrides in an event
    .delete(authCheck, removeTaskFromEvent); // Remove a task from an event
  
  module.exports = router;
  
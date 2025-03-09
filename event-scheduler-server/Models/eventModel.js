const mongoose = require("mongoose");

const eventTaskSchema = new mongoose.Schema({
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Task", 
    required: true 
  },
  // Optional override fields for the assigned task
  duration: { type: Number },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true  // Ensure each event has a unique title
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  tasks: [eventTaskSchema] // Array of tasks assigned to the event
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);

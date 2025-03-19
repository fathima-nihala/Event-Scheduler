const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true, description: "Task duration in hours"  }, 
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], 
  timing: {
    relation: { type: String, enum: ["before", "after", "start", "end"], required: true, description: "Relation type to dependent tasks" },
    offset: { type: Number, required: true },
    unit: { type: String, enum: ["minutes", "hours", "seconds"], default: "minutes" , description: "Unit for the offset value"}
  },
  startDate: { type: Date, description: "Optional specific start date for the task" },
  isGlobal: { type: Boolean, default: false }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: function() { return !this.isGlobal; } }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);

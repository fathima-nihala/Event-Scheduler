const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true }, 
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], 
  timing: {
    relation: { type: String, enum: ["before", "after", "start", "end"], required: true },
    offset: { type: Number, required: true } 
  },
  isGlobal: { type: Boolean, default: false }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: function() { return !this.isGlobal; } }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
